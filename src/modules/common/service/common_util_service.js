import { define } from 'src/containerHelper'

const validationSchemas = require('../../../interfaces/http/middlewares/validators/schemas')

module.exports = define('commonUtilService', ({
  awsService, config, eventBodyValidateService, logger, CustomError, constants: { RUNTIME_ERROR }, eventConfigService
}) => {

  const sendMessageToQueue = async (body) => {
    const { data, eventName, eventType } = body
    logger.info(`sendMessageToQueue called event Name: ${eventName}`)
    const queueName = config.AWS.SQS.APP_EVENT_SQS_NAME
    let eventConfig = await eventConfigService.getEventConfig({ name: eventName, type: eventType })
    if (!eventConfig) {
      throw new CustomError(RUNTIME_ERROR.code, RUNTIME_ERROR.status, 'Event config not found')
    }
    eventConfig = eventConfig.get({ plain: true })
    let schemaToValidate
    // // TODO logic to pick default schema
    if (eventConfig.validationSchemaFile && eventConfig.schema) {
      schemaToValidate = validationSchemas[eventConfig.validationSchemaFile][eventConfig.schema]
    }
    try {
      await eventBodyValidateService.validateEventObj(eventConfig, schemaToValidate, data)
      awsService.sendToQueue(queueName, { eventName, data })
    } catch (error) {
      logger.error(`Error while pushing message into queue`, error)
      throw new CustomError(RUNTIME_ERROR.code, RUNTIME_ERROR.status, error)
    }
  }

  return {
    sendMessageToQueue,
  }
})
