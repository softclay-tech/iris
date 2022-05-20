const fs = require('fs')
const bluebird = require('bluebird')
const util = require('util')
/**
 * @typedef Config
 * @type {Object}
 * @property {string} host - DB host
 * @property {string} port - DB port
 * @property {string} user - DB username
 * @property {string} password - DB password
 * @property {string} certificate - DB certificate file link
 * @property {string} database - DB name
 * @property {string} poolsize - DB connections to keep open
 */

/**
 * Get database connection params for Document DB
 * @param {Config} config - config for DB
 * @returns {{ url: string, options: object }} Connection params
 */
const getConnectionObject = (config, name) => {
  const { host, port, user, password, certificate, database, poolSize } = config

  if (!host) {
    console.error(`Invalid Host name for ${name}`)
    return
  }

  if (!database) {
    console.error(`Invalid Database name for ${name}`)
    return
  }

  const url = `mongodb+srv://${host}/${certificate ? '?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false' : ''}`
  return {
    url: url,
    options: {
      useNewUrlParser: true,
      bufferCommands: true,
      autoIndex: false,
      // promiseLibrary: bluebird,
      dbName: database,
      sslValidate: !!certificate,
      sslCA: certificate ? [fs.readFileSync(certificate)] : null,
      user: user || null,
      pass: password || null
      // poolSize: poolSize,
      // useMongoClient: true,
    }
  }
}

module.exports = {
  getConnectionObject
}
