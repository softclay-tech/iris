import {
  define
} from 'src/containerHelper'
import _ from 'lodash'
module.exports = define('configMasterService', ({
  cachingService: {
    getOrSetFnResultInCache,
    clearCache
  },
  CustomError,
  constants,
  configMasterRepository,
  generalUtilService: {
    getPlainObjects,
    parseToJSON
  }
}) => {
  const cacheKeys = {
    CONFIG_CACHE: 'CONFIG_CACHE'
  }
  /* -------------------------------------------------------------------------- */
  /*                               Error Wrappers                               */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                               Candidate Action Service Methods             */
  /* -------------------------------------------------------------------------- */

  const createConfig = async configMasterEntity => {
    const result = await configMasterRepository.createConfig(configMasterEntity)
    return result
  }

  const _handleConfigUpdate = async configObj => {
    await clearCache(cacheKeys.CONFIG_CACHE, configObj.id)
    await clearCache(cacheKeys.CONFIG_CACHE, `${configObj.name}_${configObj.schema}`)
  }

  const updateConfig = async (configMasterEntity, id) => {
    const configObj = await getConfigById(id)
    if (_.isEmpty(configObj)) throw new CustomError(constants.RUNTIME_ERROR.code, constants.RUNTIME_ERROR.status, `Config not found !`)
    const result = await configMasterRepository.updateConfig(configMasterEntity, id)
    await _handleConfigUpdate(configObj)
    return result
  }

  const getConfigByName = async (configName, schema = 'default') => {
    return getOrSetFnResultInCache(cacheKeys.CONFIG_CACHE, `${configName}_${schema}`, async () => {
      const res = await configMasterRepository.getConfig({
        name: configName,
        schema
      })
      return parseToJSON(res.value)
    })
  }
  const getConfigById = async id => {
    return getOrSetFnResultInCache(cacheKeys.CONFIG_CACHE, id, async () => {
      const res = await configMasterRepository.getConfig({
        id
      })
      return parseToJSON(res.value)
    })
  }
  return {
    createConfig,
    updateConfig,
    getConfigById,
    getConfigByName
  }
})
