import httpContext from 'express-cls-hooked'
const meld = require('meld')
const CircularJSON = require('circular-json')
const util = require('util')

const serviceLogger = (container, logger) => {
  const allModules = container.loadModules(['app/**/*.js']).registrations

  const _getErrorMessage = (type, serviceKey, functionName, result) => {
    switch (type) {
      case 'before':
        return `Before Arguments passed by ${serviceKey}-${functionName} are :: ${CircularJSON.stringify(
          result
        )}`
      case 'after':
        return `Return Value by ${serviceKey}-${functionName} are :: ${CircularJSON.stringify(
          result
        )}`
      default:
        return `Exception Thrown by ${serviceKey}-${functionName} is :: ${result}`
    }
  }

  for (let [serviceKey] of Object.entries(allModules)) {
    if (serviceKey.indexOf('Service') > 0) {
      const serviceName = container.cradle[serviceKey]
      for (const functionName of Object.values(Object.keys(serviceName))) {
        // Call a function after
        httpContext.set('serviceKey', serviceKey)
        httpContext.set('functionName', functionName)
        meld.before(serviceName, functionName, function (response) {
          if (response instanceof Promise) {
            response.then(args => {
              logger.info(
                _getErrorMessage('before', serviceKey, functionName, args),
                { service: { service_key: serviceKey, function_name: functionName } }
              )
            })
          } else {
            logger.info(
              _getErrorMessage('before', serviceKey, functionName, response),
              { service: { service_key: serviceKey, function_name: functionName } }
            )
          }
        })

        // Call a function after
        meld.after(serviceName, functionName, function (response) {
          if (response instanceof Promise) {
            response
              .then(args => {
                // logger.info(
                //   _getErrorMessage('after', serviceKey, functionName, args)
                // )
              })
              .catch(error => {
                let customError = error
                if (error instanceof Error) {
                  customError = util.format(error)
                }
                logger.error(_getErrorMessage('error', serviceKey, functionName, customError), null, { service: { service_key: serviceKey, function_name: functionName } })
              })
          } else {
            // logger.info(
            //   _getErrorMessage('after', serviceKey, functionName, response)
            // )
          }
        })
      }
    }
  }
}
module.exports = {
  serviceLogger
}
