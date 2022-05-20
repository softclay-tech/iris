import httpContext from 'express-cls-hooked'
const cls = require('cls-hooked')
const nsid = 'a6a29a6f-6747-4b5f-b99f-07ee96e32f88'
const AWS = require('aws-sdk')
const uuidv4 = require('uuid/v4')

module.exports = ({
  config,
  logger }) => {
  AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
    region: config.AWS_REGION
  })

  const queueUrlConfig = new Map()

  const sendToQueue = async (queueName, message) => {
    const sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    let queueUrl = queueUrlConfig.get(queueName)
    if (!queueUrl) {
      queueUrl = await getQueueUrlFromName(queueName)
      queueUrlConfig.set(queueName, queueUrl)
    }
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl
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

  // Changed to Throttling :)
  const registerSQSPooling = async (eventCommandExecuter, config) => {
    const queueName = config.getQueueName()
    const executeAllSync = config.executeAllSync || true
    const queueUrl = await getQueueUrlFromName(queueName)
    const params = {
      AttributeNames: ['SentTimestamp'],
      MaxNumberOfMessages: config.maxNumberOfMessages || 10,
      MessageAttributeNames: ['All'],
      QueueUrl: queueUrl,
      VisibilityTimeout: config.visibilityTimeout || 150,
      WaitTimeSeconds: config.waitTimeSeconds || 10
    }
    AWS.config.update({
      region: 'ap-south-1'
    })
    const sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    const deleteMsgFromSQS = async (deleteParams, eventName) => {
      sqs.deleteMessage(deleteParams).promise().then(() => {
        logger.info(`Deleting ${eventName} From ${queueName} Successful, Delete Params :: ${JSON.stringify(deleteParams)}`)
      }).catch(err => {
        logger.error(`Failed To delete ${eventName} from ${queueName} :: Error :: `, err)
      })
    }
    // this will be throttled
    const pullMsgFromQueue = async () => {
      await sqs.receiveMessage(params).promise().then(async data => {
        if (data.Messages && data.Messages.length > 0) {
          for (let message of data.Messages) {
            await sqsMiddleware(message, async function (message) {
              const messageBody = JSON.parse(message.Body)
              if (messageBody) {
                await setRequestContext(message.MessageId, messageBody, async function (messageBody) {
                  const deleteParams = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                  }
                  const eventName = messageBody.eventName
                  logger.info(`Received Event :: ${eventName}, Message Data:: ${JSON.stringify(messageBody.data)}`)
                  if (executeAllSync) {
                    await eventCommandExecuter({
                      ...messageBody,
                      config
                    })
                      .then(async () => {
                        logger.info(`Running Listeners in Sync for event :: ${eventName}`)
                        await deleteMsgFromSQS(deleteParams, eventName)
                      }).catch(error => {
                        logger.error(`Error Running Listeners Sync :: Event :: ${eventName}, data: ${JSON.stringify(messageBody.data)}, Error ::`, error)
                      })
                  } else {
                    await eventCommandExecuter(messageBody)
                      .then(async () => {
                        logger.info(`Published Event Async:: ${eventName}`)
                        await deleteMsgFromSQS(deleteParams, eventName)
                      }).catch(error => {
                        logger.error(`Error Publishing Async Event :: ${eventName}, data: ${JSON.stringify(messageBody.data)}, Error ::`, error)
                      })
                  }
                })
              }
            })
          }
        }
        setImmediate(pullMsgFromQueue, 1000)
      }).catch(error => {
        logger.error(` Failed To Pull Message, ${queueName} Error ::`, error)
        setImmediate(pullMsgFromQueue, 1000)
      })
    }
    setImmediate(pullMsgFromQueue, 1000)
  }
  const createQueue = (queueName, attributes) => {
    var sqs = new AWS.SQS({
      apiVersion: '2012-11-05'
    })
    var params = {
      QueueName: queueName,
      Attributes: attributes
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

  return {
    sendToQueue,
    registerSQSPooling,
    uploadFileOnS3,
    getPreSignedUrlForDownload
  }
}
