import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status'
module.exports = ({
  logger,
  config,
  CustomError,
  response: { Fail }
}) => async (err, req, res, next) => {
  if (err) {
    if (err instanceof CustomError) {
      return res.status(err.status).send(
        await Fail(
          Object.assign(
            {
              type: err.code,
              description: err.message,
              data: err.data
            },
            (config.env === 'development' || config.env === 'staging' || config.env === 'test') && {
              message: err.message,
              stack: err.stack
            }
          ), req?.user?.language_master?.languageShortName || err.lang || 'en_US'
        )
      )
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(BAD_REQUEST).send(
        await Fail(
          Object.assign(
            {
              type: err.errors[0].type.split(' ').join('_'),
              description: err.errors[0].message,
              field: err.errors[0].path
            },
            (config.env === 'development' || config.env === 'test') && {
              message: err.message,
              stack: err.stack
            }
          ), req?.user?.language_master?.languageShortName || 'en_US'
        )
      )
    } else if (err.name === 'SequelizeValidationError') {
      return res.status(BAD_REQUEST).send(
        await Fail(
          Object.assign(
            {
              type: err.errors[0].type.split(' ').join('_'),
              description: err.errors[0].message,
              field: err.errors[0].path
            },
            (config.env === 'development' || config.env === 'test') && {
              message: err.message ? String(err.message) : err.message,
              stack: err.stack
            }
          ), req?.user?.language_master?.languageShortName || 'en_US'
        )
      )
    } else {
      const response = Object.assign(
        {
          type: 'InternalServerError'
        },
        (config.env === 'development' || config.env === 'test') && {
          message: err.message,
          stack: err.stack
        }
      )

      res.status(INTERNAL_SERVER_ERROR).json(await Fail(response, req?.user?.language_master?.languageShortName))
    }
  }
}
