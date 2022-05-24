import { define } from '../../../containerHelper'

module.exports = define('eventLogRepository', ({
  mongoDBConn,
  logger
}) => {

  const notificationConfigSchema = new mongoDBConn.base.Schema({
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  })

  notificationConfigSchema.index({ name: 1 }, { name: 'name_idx' })

  const notificationConfigMongoModel = mongoDBConn.model('event_log_doc', notificationConfigSchema)

  const createV3Config = notificationConfig =>
    notificationConfigMongoModel.create(notificationConfig)

  return {
    createV3Config
  }
})
