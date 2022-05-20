import { resolve } from 'path'
const dotEnvPath = resolve('.env')
require('dotenv').config({ path: dotEnvPath })

module.exports = {
  'host': process.env.REDIS_HOST,
  'port': process.env.REDIS_PORT
}
