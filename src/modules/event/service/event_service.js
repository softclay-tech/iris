import {
  define, getService
} from 'src/containerHelper'

const expr = require('expression-eval')
const ejs = require('ejs')
const { clone } = require('ramda')

module.exports = define('eventService', ({
  logger,
  CustomError,
  eventConfigService,
  eventLogDocRepository
}) => {
  const handleEventAppNotificationQueue = async (messageObj) => {
    try {
      await processMessage(messageObj)
    } catch (err) {
      if (err instanceof CustomError) {
      } else {
        logger.error(`NotificationService === Error in processMessage ${err}`, err.stack)
      }
      throw err
    }
  }

  const processMessage = async (messageObj) => {
    const { eventName, eventType } = messageObj
    let enrichedData = messageObj.data
    let eventConfig = await eventConfigService.getEventConfig({ name: eventName, type: eventType })
    eventConfig = eventConfig.get({ plain: true })
    if (eventConfig.serviceName && eventConfig.methodName) {
      enrichedData = await enrichData(eventConfig.serviceName, eventConfig.methodName, messageObj.data)
    }
    const parsedEventConfig = await parseEventConfig(eventConfig, enrichedData)
    eventLogDocRepository.create({eventName, eventData: parsedEventConfig}) // logging event in mongo
    console.log('parsedEventConfig',parsedEventConfig)
  }

  const enrichData = async (serviceName, methodName, data) => {
    try {
      let serviceCls = getService(serviceName)
      let methodObj = serviceCls[methodName]
      if (typeof methodObj === 'function') {
        const response = await methodObj(data)
        return response
      }
    } catch (e) {
      logger.error(`Error in invoke method call`, e)
      throw e
    }
  }

  const testEvent = async (body) => {
    await handleEventAppNotificationQueue(body)
  }

  const parseEventConfig = async (eventConfig, data) => {
    let response = {}
    if (eventConfig && data) {
      const eConfig = clone(eventConfig.config)
      const variables = await parseTemplateVariables(eventConfig, eConfig, data)
      response = {
        ...eConfig,
        variables,
      }
    }

    return response
  }

  const parseTemplateVariables = async (eventConfig, eConfig, data) => {
    const { type, name: eventName } = eventConfig
    try {
      const configVariables = eConfig.variables
      const response = {}
      if (configVariables) {
        for (const i in configVariables) {
          const v = configVariables[i]
          const key = getKeyName(type, v)
          response[key] = await getValue(v, data, type)
        }
      }
      return response
    } catch (err) {
      logger.error(`Event name:${eventName}, type:${type} ==== error in parseTemplateVariables====== `, err)
      return []
    }
  }

  const getKeyName = (notificationType, param) => {
    return param.key
  }

  const getSanitizedValue = (eventType, val) => {
    return val
  }

  const getValue = async (variableConfig, data, eventType) => {
    let value = ''
    const ast = expr.parse(variableConfig.valueExpr)
    value = getSanitizedValue(eventType, expr.eval(ast, data))
    if (variableConfig.isEjs) {
      value = ejs.render(value, data)
    }
    return value
  }

  const parseActionConfig = async (actionConfig, data, eventName, eventType) => {
    // try {
    //   const response = {}
    //   if (actionConfig.actionVariables) {
    //     const { actionVariables } = actionConfig
    //     for (const i in actionVariables) {
    //       const v = actionVariables[i]
    //       const key = getKeyName(type, v)
    //       response[key] = await getValue(v, data, type)
    //     }
    //     return response
    //   }
    //   logger.info(`Event name:${eventName}, type:${eventType} ==== actionConfig missing `)
    //   return null
    // } catch (err) {
    //   logger.error(`Event name:${eventName}, type:${eventType} ==== error in parseActionConfig====== `, err)
    //   return []
    // }
  }

  return {
    handleEventAppNotificationQueue,
    testEvent
  }
})
