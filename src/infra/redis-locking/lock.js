const RedLock = require('redlock')
const Redis = require('ioredis')

module.exports = (config, { driftFactor, retryCount, retryDelay, retryJitter }) => {
  let redisClient = null
  if (config.IS_REDIS_CLUSTER) {
    redisClient = new Redis.Cluster(config.redisCluster)
  } else {
    redisClient = new Redis(config.redisConfig)
  }

  redisClient.on('error', function (err) {
    console.error('Redis Connection Error ', err)
  })
  const RedisLock = new RedLock(
    [redisClient],
    {
      driftFactor,
      retryCount,
      retryDelay,
      retryJitter
    }
  )
  return RedisLock
}
