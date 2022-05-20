import { resolve } from 'path'
const dotEnvPath = resolve('.env')
/**
 * since mocha don't see environment variables we have to use dotenv
 */
require('dotenv').config({ path: dotEnvPath })
module.exports = {
  development: {
    authStrategy: process.env.MONGO_DB_AUTH_STRATEGY,
    database: process.env.MONGO_DB_DATABASE,
    host: process.env.MONGO_DB_HOST,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    port: process.env.MONGO_DB_PORT
  },
  test: {
    authStrategy: process.env.MONGO_DB_AUTH_STRATEGY,
    database: process.env.MONGO_DB_DATABASE,
    host: process.env.MONGO_DB_HOST,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    port: process.env.MONGO_DB_PORT
  },
  staging: {
    authStrategy: process.env.MONGO_DB_AUTH_STRATEGY,
    database: process.env.MONGO_DB_DATABASE,
    host: process.env.MONGO_DB_HOST,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    port: process.env.MONGO_DB_PORT
  },
  production: {
    authStrategy: process.env.MONGO_DB_AUTH_STRATEGY,
    database: process.env.MONGO_DB_DATABASE,
    host: process.env.MONGO_DB_HOST,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    port: process.env.MONGO_DB_PORT
  }
}
