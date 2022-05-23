import {
  define
} from 'src/containerHelper'

module.exports = define('eventUtilService', ({
  logger,
  CustomError,
  eventConfigRepository
}) => {
  const parseEventConfig = async () => {
    // TODO Add logic
  }

  return {
    parseEventConfig
  }
})
