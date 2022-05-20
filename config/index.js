require('dotenv').load()

const fs = require('fs')
const path = require('path')

function loadDbConfig () {
  if (fs.existsSync(path.join(__dirname, './database.js'))) {
    return require('./database')[ENV]
  }

  throw new Error('Database is configuration is required')
}

function loadMongoDbConfig () {
  if (fs.existsSync(path.join(__dirname, './mongo_db.js'))) {
    return require('./mongo_db')[ENV]
  }

  throw new Error('Mongo Database configuration is required')
}

const ENV = process.env.NODE_ENV || 'development'

const envConfig = require(path.join(__dirname, 'environments', ENV))
const dbConfig = loadDbConfig()
const mongoDBConfig = loadMongoDbConfig()
const redisConfig = require('./redis_config')
const config = Object.assign(
  {
    env: ENV,
    db: dbConfig,
    mongoDBConn: mongoDBConfig,
    redisConfig
  },
  envConfig
)

module.exports = config
