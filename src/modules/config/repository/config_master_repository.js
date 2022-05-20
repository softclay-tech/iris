import {
  define
} from 'src/containerHelper'

module.exports = define('configMasterRepository', ({
  database
}) => {
  const ConfigMaster = database['config_master']

  const getAllConfig = async whereClause => ConfigMaster.findAll({
    where: {
      recordStatus: 1,
      ...whereClause
    }
  })

  const getConfig = async whereClause => ConfigMaster.findOne({
    where: {
      recordStatus: 1,
      ...whereClause
    }
  })

  const createConfig = async configMasterEntity => ConfigMaster.create(configMasterEntity)

  const updateConfig = async (configMasterEntity, id) => ConfigMaster.update(configMasterEntity, { where: { id } })

  return {
    getAllConfig,
    getConfig,
    createConfig,
    updateConfig
  }
})
