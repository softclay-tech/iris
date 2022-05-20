/* eslint-disable no-new */
import { isEmpty } from 'ramda'
const ip = require('ip')
const HEALTH_CHECK = 'healthCheck'

module.exports = ({ redisClient }) => {
  let serverState = 'ACTIVE'
  let cacheKey = ip.address()
  redisClient.setKey(HEALTH_CHECK, cacheKey, { serverState: serverState }, 600000)

  const getState = async () => {
    let currentServerStatus = await redisClient.getKey(HEALTH_CHECK, cacheKey)
    if (isEmpty(currentServerStatus)) {
      currentServerStatus = { serverState: serverState }
      await redisClient.setKey(HEALTH_CHECK, cacheKey, currentServerStatus, 600000)
    }
    return currentServerStatus.serverState
  }

  const updateState = async (state) => {
    let currentServerStatus = { serverState: state }
    await redisClient.setKey(HEALTH_CHECK, cacheKey, currentServerStatus, 600000)
    return currentServerStatus.serverState
  }

  return {
    updateState,
    getState
  }
}
