const Joi = require('joi')
const { indexOf, map, isNil } = require('ramda')

import { define } from 'src/containerHelper'

module.exports = define('eventBodyValidateService', ({
  config,
  logger,
  CustomError,
  constants,
  validators
}) => {

  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  }

  const validateEventObj = async (eventConfig, schema, validateBody) => {
    logger.info(`validateEventObj init for ${eventConfig.name} and type :  ${eventConfig.type}`)
    return Joi
      .object()
      .validateAsync.call(schema, validateBody, _validationOptions)
      .then(value => {
        return value
      })
      .catch(error => {
        if (error) {
          // Joi Error
          const JoiError = {
            status: 'failed',
            error: {
              original: error._object,
              // fetch only message and type from each error
              details: map(
                error => ({
                  message: error.message.replace(/['"]/g, ''),
                  field:
                    error.path && error.path.length ? error?.path?.[0]?.replace(/['"]/g, '') : error?.context?.peers ? error.context.peers : '',
                }),
                error.details
              ),
            },
          }
          if (config.env === 'DEVELOPMENT') {
            logger.info(JoiError)
          }
          // Custom Error
          throw new CustomError(
            constants.INVALID_REQUEST.code,
            constants.INVALID_REQUEST.status,
            isNil(JoiError.error.details) ? 'Please check the request again' : JoiError.error.details
          )

        }
      })
  }

  return {
    validateEventObj
  }
})
