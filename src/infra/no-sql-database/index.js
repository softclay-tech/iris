const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const helper = require('./helper')
String.prototype.toObjectId = function() {
  const ObjectId = mongoose.Types.ObjectId
  return new ObjectId(this.toString())
};
module.exports = ({ config, logger }) => {
  try {
    const { mongoDBConfig } = config
    console.log('conif')
    if (!mongoDBConfig || !mongoDBConfig.host) {
      throw new Error('Mongo DB config not found !')
    }
    mongoose.Promise = require('bluebird')
    const connObj = helper.getConnectionObject(mongoDBConfig, 'Primary mongoDB')
    mongoose.set('debug', { shell: true })
    const conn = mongoose.createConnection(connObj.url, connObj.options)
    logger.info('Connected to Mongo DB')
    return conn
  } catch (e) {
    logger.error('Unable to connect to Mongo DB :  ', e)
    process.exit(0)
  }
}
