import { define } from 'src/containerHelper'

module.exports = define('eventLogDocRepository', ({
  eventLogDocModel
}) => {

  const create = async log =>
    await eventLogDocModel.create(log)

  return {
    create
  }
})