import { errorCodes } from './error_codes'
const events = require('./event_list')


const environments = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
}

const HASH_ROUND = 10
const TOKEN_EXPIRATION = '7d' // 86400 // expires in 24 hours




module.exports = {
  events,
  ...errorCodes,
  ...environments,
  HASH_ROUND,
  TOKEN_EXPIRATION,
}
