import {
  define
} from 'src/containerHelper'
const uuidv4 = require('uuid/v4')

module.exports = define('eventConfigService', ({
  logger,
  CustomError,
  eventConfigRepository

}) => {
  const getEventConfig = async ({ name, type }) => {
    try {
      if (name) {
        const whereClause = { name }
        if (type) {
          whereClause[type] = type
        }
        return eventConfigRepository.getConfig(whereClause)
      } else {
        logger.error(`eventConfigService === eventName not provided`)
      }
    } catch (err) {
      if (err instanceof CustomError) {
      } else {
        logger.error(`NotificationService === Error in processMessage ${err}`, err.stack)
      }
      throw err
    }
  }

  const parseEventConfig = async () => {
    const eventLogObj = {
      id: uuidv4(),
      name: 'EVENT_NAME'
    }
    // TODO Add logic
  }

  parseEventConfig()
  return {
    getEventConfig,
    parseEventConfig
  }
})
