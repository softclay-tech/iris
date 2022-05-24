const Joi = require('joi')
const joi = require('joi')
const { indexOf, map, isNil } = require('ramda')

import { define } from 'src/containerHelper'

module.exports = define('eventBodyValidateService', ({
  config,
  logger,
  healthCheckService,
  CustomError
}) => {

  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  }
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]+$'))
  })

  const validateEventObj = async (validateBody) => {
    console.log('validateEventObj',validateEventObj)
    return joi
      .object()
      .validateAsync(schema, validateBody, _validationOptions)
      .then(value => {
        console.log('validateEventObj', value)

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
          // next(
          //   new CustomError(
          //     INVALID_REQUEST.code,
          //     INVALID_REQUEST.status,
          //     isNil(JoiError.error.details) ? 'Please check the request again' : JoiError.error.details
          //   )
          // );
        }
      })
  }

  return {
    validateEventObj
  }
})
