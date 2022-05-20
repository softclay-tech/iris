module.exports = () => {
  class CustomError extends Error {
    constructor (code = 'GENERIC', status = 500, message = '', data = {}, ...params) {
      super(...params)

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError)
      }

      this.code = code
      this.status = status
      this.message = message
    }
  }
  return CustomError
}
