import {
  define
} from 'src/containerHelper'

module.exports = define('eventConfigRepository', ({
  database
}) => {
  const EventConfigModel = database['event_config']

  const getConfig = async whereClause => EventConfigModel.findOne({
    where: {
      recordStatus: 1,
      ...whereClause
    }
  })


  return {
    getConfig
  }
})
