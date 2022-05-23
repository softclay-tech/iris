import { define } from 'src/containerHelper'

module.exports = define('commonUtilService', ({ awsService, config }) => {

  const sendMessageToQueue =  (body) => {
    console.log('sendMessageToQueue called')
    const queueName = config.AWS.SQS.APP_EVENT_SQS_NAME
    const eventName = 'TEST EVENT'
    const data = {
      'name': 'kamlesh'
    }
    awsService.sendToQueue(queueName, { eventName, data })
  }

  return {
    sendMessageToQueue,
  }
})
