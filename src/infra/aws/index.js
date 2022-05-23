import httpContext from 'express-cls-hooked'
const cls = require('cls-hooked')
const nsid = 'a6a29a6f-6747-4b5f-b99f-07ee96e32f88'
const AWS = require('aws-sdk')
const uuidv4 = require('uuid/v4')
const PromiseBlueBird = require('bluebird')

module.exports = ({
  config,
  logger,
  healthCheckService,
  CustomError
}) => {

  const SQS_CONNECT_TIMEOUT = process.env.SQS_CONNECT_TIMEOUT || 2000
  // const SQS_MAX_RETRIES = process.env.SQS_MAX_RETRIES || 1

  AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
    region: config.AWS_REGION
  })

  const queueUrlConfig = {}
  const listnerConfig = {}

  const sendToQueue = async (queueName, message) => {
    const sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    let queueUrl = queueUrlConfig[queueName]
    if (!queueUrl) {
      queueUrl = await getQueueUrlFromName(queueName)
      queueUrlConfig[queueName] = queueUrl
    }
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl,
      MessageGroupId: '2'
    }
    return sqs.sendMessage(params).promise()
  }
  const getQueueUrlFromName = async (queueName) => {
    const sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    let params = {
      QueueName: queueName
    }
    let queueUrl = null
    let queueResult = null
    try {
      queueResult = await sqs.getQueueUrl(params).promise()
      queueUrl = queueResult.QueueUrl
      return queueUrl
    } catch (e) {
      await createQueue(queueName, {
        'ReceiveMessageWaitTimeSeconds': '5'
      })
      queueResult = await sqs.getQueueUrl(params).promise()
      queueUrl = queueResult.QueueUrl
      return queueUrl
    }
  }

  const createQueue = (queueName, attributes) => {
    const sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    const params = {
      QueueName: queueName,
      Attributes: { ...attributes, 'FifoQueue': 'true', 'ContentBasedDeduplication': 'true' }
    }

    return sqs.createQueue(params).promise()
  }

  const sqsMiddleware = async (message, next) => {
    const ns = cls.getNamespace(nsid) || cls.createNamespace(nsid)
    return ns.runAndReturn(() => next(message))
  }
  const setRequestContext = async (messageId, messageObj, fn) => {
    if (!messageObj.data.context) {
      messageObj.data.context = {
        request_id: uuidv4()
      }
    }
    if (httpContext) {
      httpContext.set('MessageId', messageId)
      for (let i in messageObj.data.context) {
        httpContext.set(i, messageObj.data.context[i])
      }
      logger.info(`Hi`)
    }
    return fn(messageObj)
  }

  const uploadFileOnS3 = (s3bucket, fileName, file, contentType) => {
    const s3 = new AWS.S3({ apiVersion: 'v1' })
    const params = {
      Bucket: s3bucket,
      Key: fileName,
      Body: file
    }
    if (contentType) {
      params.ContentType = contentType
    }
    return new Promise((resolve, reject) => {
      s3.upload(params, (error, output) => {
        if (output) {
          output.fileName = fileName
        }
        return error ? reject(error) : resolve(output)
      })
    })
  }

  const getPreSignedUrlForDownload = async (bucketName, fileName, expiryTime) => {
    let signedUrl = null
    const s3 = new AWS.S3({
      signatureVersion: 'v4'
    })

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Expires: expiryTime
    }

    try {
      signedUrl = await s3.getSignedUrlPromise('getObject', params)
    } catch (err) {
      logger.error('Error creating presigned URL for fileName: ' + fileName, err)
    }
    return signedUrl
  }

  const subscribeQueue = (listener, queueName, eventMethod, QueueParams = {}) => {
    listnerConfig[queueName] = listener
    registerLongPolling(listener, queueName, eventMethod, QueueParams)
  }

  const registerLongPolling = async (listener, queueName, eventMethod, QueueParams) => {
    try {
      const sqs = new AWS.SQS({ apiVersion: '2012-11-05', httpOptions: { connectTimeout: SQS_CONNECT_TIMEOUT } })
      let queueUrl = queueUrlConfig[queueName]
      if (!queueUrlConfig[queueName]) {
        queueUrl = await getQueueUrlFromName(queueName)
        queueUrlConfig[queueName] = queueUrl
      }

      const params = {
        AttributeNames: [
          'SentTimestamp'
        ],
        MaxNumberOfMessages: QueueParams.MaxNumberOfMessages || 10,
        MessageAttributeNames: [
          'All'
        ],
        QueueUrl: queueUrl,
        WaitTimeSeconds: QueueParams.WaitTimeSeconds || 10,
        VisibilityTimeout: QueueParams.VisibilityTimeout || 60
      }

      if (process.env.IS_QUEUE_PROCESSING_ENABLED != undefined && process.env.IS_QUEUE_PROCESSING_ENABLED === 'false') {
        logger.info(`subscribe to queue ${queueName} is stopped from server as IS_QUEUE_PROCESSING_ENABLED is false`)
      } else {
        const healthCheckStatus = await healthCheckService.getState()
        logger.info(`subscribe to queue ${queueName} is done with read status as ${healthCheckStatus}`)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (healthCheckStatus === 'ACTIVE') {
          const data = await sqs.receiveMessage(params).promise()
          if (data.Messages && data.Messages.length > 0) {
            logger.info(`message received from queue ${queueName} length ${data.Messages.length} ${JSON.stringify(data)}`)
            const processed = []
            await PromiseBlueBird.map(data.Messages, async (processMessage) => {
              await sqsMiddleware(processMessage, async function (message) {
                try {
                  const messageObj = JSON.parse(message.Body)
                  if (messageObj.data) {
                    messageObj.awsSQSMessageId = message.MessageId

                    await setRequestContext(message.MessageId, messageObj, async function (messageObj) {
                      logger.info(`message queue info ${queueName} ${JSON.stringify(messageObj)}`)
                      await listener[`handleEvent${eventMethod}`](messageObj)
                    })
                    processed.push(message)
                  }
                } catch (err) {
                  if (err instanceof CustomError) {
                    logger.info(`Custom error in message queue info ${queueName} ${JSON.stringify(message)}`, err)
                  } else {
                    let messageBody = JSON.parse(message.Body)
                    logger.error(`Error in message queue info ${queueName} ${messageBody.notificationName} ${JSON.stringify(message)}`, err)
                  }
                }
              })
            }, { concurrency: QueueParams.concurrency || 10 })
            if (processed.length > 0) {
              const result = await deleteMessage(sqs, processed, queueUrl)
              logger.info(`Deleting message queue info ${queueName} length ${processed.length} ${JSON.stringify(processed)} ${JSON.stringify(result)}`)
            }
          }
        }
      }
    } catch (ex) {
      logger.error('exception while registering for long polling', ex)
      throw ex
    }
  }

  const deleteMessage = async (sqs, messages, queueURL) => {
    try {
      const deleteParams = {
        QueueUrl: queueURL,
        Entries: []
      }
      for (let i in messages) {
        deleteParams.Entries.push({ Id: i, ReceiptHandle: messages[i].ReceiptHandle })
      }
      return sqs.deleteMessageBatch(deleteParams).promise()
    } catch (err) {
      logger.info('Error in deletting message from queue' + queueURL, err)
    }
  }

  return {
    sendToQueue,
    registerLongPolling,
    uploadFileOnS3,
    getPreSignedUrlForDownload,
    subscribeQueue
  }
}
