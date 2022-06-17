import { define } from 'src/containerHelper'

module.exports = define('eventLogDocModel', ({
    mongoDBConn,
}) => {

    const eventLogDocSchema = new mongoDBConn.base.Schema({
        eventName: {
            type: String,
            required: true
        },
        eventData: {
            type: Object,
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

    eventLogDocSchema.index({ eventName: 1 }, { name: 'name_idx' });
    return mongoDBConn.model('event_log_doc', eventLogDocSchema)
})