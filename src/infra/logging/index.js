import logger from './logger'
import httpContext from 'express-cls-hooked'
const R = require('ramda')

const mergeUserData = (data, eventAttributes = {}) => {
  if (typeof eventAttributes !== 'object') {
    eventAttributes = {}
  }
  const user = httpContext.get('currentuser') || httpContext.get('user')
  const requestId = httpContext.get('request_id')
  const messageId = httpContext.get('MessageId')
  const eventId = httpContext.get('event_id')
  const reqBody = httpContext.get('reqBody')
  const reqQuery = httpContext.get('reqQuery')
  const apiName = httpContext.get('path')
  const clientIP = httpContext.get('clientIP')
  const eventName = httpContext.get('event_name')
  const reqIp = httpContext.get('req_ip')
  const userAgent = httpContext.get('user_agent')
  const serviceKey = httpContext.set('serviceKey')
  const functionKey = httpContext.set('functionName')
  eventAttributes.request = {
    req_body: reqBody,
    api_name: apiName,
    req_query: reqQuery,
    client_ip: clientIP,
    req_ip: reqIp,
    user_agent: userAgent
  }
  const service = {
    service_key: serviceKey,
    function_key: functionKey
  }
  let meta = {}
  const event = {
    event_id: eventId,
    event_name: eventName
  }
  meta = R.mergeAll([meta, { request_id: requestId }])
  if (messageId && data.message) {
    data.message = `${messageId} ${data.message}`
  }
  if (user) {
    meta = R.mergeAll([
      meta,
      { email: user.email, user_id: user.id, mobile: user.mobile }
    ])
  }
  return R.mergeAll([data, { meta: meta, ...eventAttributes, event, service }])
}

module.exports = ({ config }) => {
  const _logger = logger({ config })
  let flgSilent = false

  return {
    info: (message, eventAttributes) => {
      !flgSilent && _logger.log(mergeUserData({ level: 'info', message }, eventAttributes))
    },
    debug: (message, eventAttributes) => {
      !flgSilent && _logger.log(mergeUserData({ level: 'debug', message }, eventAttributes))
    },
    warn: (message, eventAttributes) => {
      !flgSilent && _logger.log(mergeUserData({ level: 'warn', message }, eventAttributes))
    },
    error: (message, error, eventAttributes) => {
      if (error && error instanceof Error) {
        error.message = `${message}  ${error.message}`
        !flgSilent &&
          _logger.log(mergeUserData({ level: 'error', message: error }, eventAttributes))
      } else {
        if (error) {
          message = message + JSON.stringify(error)
        }
        !flgSilent && _logger.log(mergeUserData({ level: 'error', message }, eventAttributes))
      }
    },
    silent: flg => {
      flgSilent = flg
    }
  }
}
