import { define } from '../../../containerHelper'

module.exports = define('eventInitService', ({ logger, awsService, config, eventService }) => {
  const init = () => {
    const APP_EVENT_SQS_NAME = config.AWS.SQS.APP_EVENT_SQS_NAME
    if (config.IS_EVENT_QUEUE_ENABLED !== 'false') {
      awsService.subscribeQueue(eventService, APP_EVENT_SQS_NAME, 'AppNotificationQueue', { WaitTimeSeconds: 2 })
    } else {
      logger.info('=============== listening to event queue not enabled in this instance')
    }
  }

  return {
    init
  }
})
