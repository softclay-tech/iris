/* eslint-disable */
const joi = require('joi');
const { isNil, includes, hasPath, path, map, indexOf, omit } = require('ramda');
const { pathToRegexp } = require('path-to-regexp');
const Schemas = require('./context');

module.exports = ({ CustomError, constants: { INVALID_REQUEST, DEVELOPMENT }, logger, config }) => (useJoiError = false) => {
  // useJoiError determines if we should respond with the base Joi error
  // boolean: defaults to false
  // const _useJoiError = isBoolean(useJoiError) && useJoiError

  // enabled HTTP methods for request data validation
  const _supportedMethods = ['post', 'put', 'get', 'patch'];

  // Joi validation options
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  };

  return (req, res, next) => {
    if (req?.resource?.schema) {
      const method = req.method.toLowerCase();
      // Validate req.body using the schema and validation options
      return joi
        .object()
        .validateAsync.call(req.resource.schema, req.validateBody, _validationOptions)
        .then(value => {
          // Replace req.body with the data after Joi validation
          if (indexOf(method, ['post', 'put', 'patch']) >= 0) {
            req.body = value;
          } else {
            for (const key in value) {
              if (Object.prototype.hasOwnProperty.call(value, key)) {
                if (value[key] === '' || value[key] === null) {
                  delete value[key];
                }
              }
            }
            req.query = value;
          }
          next();
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
            };
            if (config.env === DEVELOPMENT) {
              logger.info(JoiError);
            }
            // Custom Error
            next(
              new CustomError(
                INVALID_REQUEST.code,
                INVALID_REQUEST.status,
                isNil(JoiError.error.details) ? 'Please check the request again' : JoiError.error.details
              )
            );
          }
        });
    }
    next();
  };
};
