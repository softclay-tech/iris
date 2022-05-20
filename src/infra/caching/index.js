import moment from 'moment'
var Redis = require('ioredis')
var zlib = require('zlib')
module.exports = ({
  config,
  logger
}) => {
  if (!config.redisConfig) {
    logger.error('Redis config file log not found, disabling Redis.')
    return false
  }
  let client = null
  if (config.IS_REDIS_CLUSTER) {
    client = new Redis.Cluster(config.redisCluster)
  } else {
    client = new Redis(config.redisConfig)
  }

  client.on('error', function (err) {
    logger.error('Redis Connection Error ', err)
  })

  const setCompressedKey = (cacheName, key, json, expiryInSeconds) => {
    // compressing the payload to reduce data transfer and memory usage in redis, thus better latency and performance
    const value = zlib.gzipSync(JSON.stringify(json)).toString('base64')

    if (expiryInSeconds) {
      client.set(constructKey(cacheName, key), value, 'EX', expiryInSeconds)
    } else {
      client.set(constructKey(cacheName, key), value)
    }
  }

  const getCompressedKey = async (cacheName, key) => {
    const res = await client.get(constructKey(cacheName, key))
    // uncompressing the value from getKey
    return res ? JSON.parse(zlib.gunzipSync(Buffer.from(res, 'base64')).toString()) : null
  }

  const setKey = (cacheName, key, json, expiryInSeconds) => {
    if (expiryInSeconds) {
      client.set(constructKey(cacheName, key), JSON.stringify(json), 'EX', expiryInSeconds)
    } else {
      client.set(constructKey(cacheName, key), JSON.stringify(json))
    }
  }

  const getKey = async (cacheName, key) => {
    const res = await client.get(constructKey(cacheName, key))
    return JSON.parse(res)
  }

  const getKeys = async (cacheName, keys, keyColumn) => {
    const finalKeys = keys.map(k => constructKey(cacheName, k))
    const resArray = await client.mget(...finalKeys)
    const result = {}
    for (let i in resArray) {
      if (resArray[i] && resArray[i].length > 0) {
        const o = JSON.parse(resArray[i])
        if (o && o[keyColumn]) {
          result[o[keyColumn]] = o
        }
      }
    }
    return result
  }

  const deleteKey = async (cacheName, key) => {
    return client.del(constructKey(cacheName, key))
  }

  const setList = async (listname, list) => {
    await client.del(listname)
    const finalList = list.map(item => JSON.stringify(item))
    return client.lpush(listname, finalList)
  }

  const incr = async (cacheName, key) => {
    return client.incr(constructKey(cacheName, key))
  }
  const decr = async (cacheName, key) => {
    return client.decr(constructKey(cacheName, key))
  }

  const expire = async (cacheName, key, expiryInSeconds) => {
    return client.expire(constructKey(cacheName, key), expiryInSeconds)
  }

  const getFromList = async (listName, limit, offset) => {
    const result = await client.lrange(listName, offset, offset + limit - 1)
    return result.map(item => JSON.parse(item))
  }
  const getListLength = async (listName, limit, offset) => {
    return client.llen(listName)
  }

  const constructKey = (cacheName, key) =>
    cacheName + '_' + key

  const atomicCounter = async (cacheName, keyName, windowSeconds, upperLimit, setExp = true) => {
    const key = keyName || parseInt(moment().valueOf() / (1000 * windowSeconds))
    const data = await incr(cacheName, key)
    const decrFunction = async () => decr(cacheName, key)
    const setCacheExpire = async () => expire(cacheName, key, windowSeconds)
    if (data) {
      const counter = parseInt(data)
      if (counter === 1 && setExp) {
        await setCacheExpire()
      }
      if (counter <= upperLimit) {
        return {
          result: true,
          counter,
          key,
          decrFunction
        }
      } else {
        const decrData = await decr(cacheName, key)
        logger.info(`redis client,  decr :: ${cacheName} :: ${decrData}`)
        return {
          result: false,
          counter: decrData,
          key
        }
      }
    } else {
      logger.error('redis client incr could not happen')
    }
  }
  const setnx = async (cacheName, key, json, expiryInMiliSeconds) => {
    const result = await client.set(
      constructKey(cacheName, key), JSON.stringify(json), 'PX', expiryInMiliSeconds, 'NX'
    )
    return result
  }
  const zadd = async ({ cacheName, key, score, value }) => {
    const result = await client.zadd(
      constructKey(cacheName, key), score, value
    )
    return result
  }
  const zpopmin = async ({ cacheName, key }) => {
    const result = await client.zpopmin(
      constructKey(cacheName, key)
    )
    return result
  }
  const zrem = async ({ cacheName, key, value }) => {
    const result = await client.zrem(
      constructKey(cacheName, key), value
    )
    return result
  }
  const rpoplpush = async (listOne, listTwo) => client.rpoplpush(listOne, listTwo)

  const popFromList = async (listName, value, count) => {
    if (count) {
      return client.lrem(listName, count, value)
    }
    return client.lrem(listName, 1, value)
  }
  const pushToList = async (listName, value) => client.lpushx(listName, value)

  const circularListPopPush = async listName => rpoplpush(listName, listName)
  // const getListLength = async listName => client.llen(listName)

  const addKeyToSortedSet = async (setName, score, key) => {
    return client.zadd(setName, score, key)
  }
  const removeKeyFromSortedSet = async (setName, key) => client.zrem(setName, key)

  const addListToSortedSet = async (list, setName) => {
    for (let index = 0; index < list.length; index++) {
      const { score, keyName } = list[index]
      await addKeyToSortedSet(setName, score, keyName)
    }
  }
  const zrange = async (setName, start = 0, stop = 0) => client.zrange(setName, start, stop)
  const zcard = async setName => client.zcard(setName)
  const zincrby = async (setName, incrBy, member) => client.zincrby(setName, incrBy, member)
  const zscore = async (setName, member) => client.zscore(setName, member)

  const exists = async (cacheName) => client.exists(cacheName)
  const hset = async (cacheName, key, value) => client.hset(cacheName, key, value)
  const hgetall = async (cacheName) => client.hgetall(cacheName)
  const batchDeletionKeysByPattern = (key) => {
    let stream = client.scanStream({
      match: key + '*'
    })
    stream.on('data', (resultKeys) => {
      if (resultKeys.length) {
        client.unlink(resultKeys)
      }
    })
    stream.on('end', () => {
      logger.info(`Done batchDeletionKeysByPattern ${key}`)
    })
  }
  const getOrSetCompressedCache = async (cacheName, key, value, hrs = 24) => {
    const cacheNameString = `COMPRESSED_KEY_${cacheName}_${key}`
    const cachedValue = await getCompressedKey(cacheNameString, key)
    if (cachedValue) {
      return cachedValue
    }
    await setCompressedKey(cacheNameString, key, value, 60 * 60 * hrs)
    return value
  }

  const getTimeToLive = (cacheName, key) => client.ttl(constructKey(cacheName, key))
  return {
    client,
    constructKey,
    expire,
    atomicCounter,
    incr,
    decr,
    getFromList,
    getListLength,
    setList,
    deleteKey,
    setCompressedKey,
    getCompressedKey,
    setKey,
    getKey,
    getKeys,
    setnx,
    zadd,
    zpopmin,
    zrem,
    rpoplpush,
    zrange,
    zcard,
    zincrby,
    zscore,
    circularListPopPush,
    pushToList,
    popFromList,
    addKeyToSortedSet,
    addListToSortedSet,
    removeKeyFromSortedSet,
    hset,
    hgetall,
    exists,
    batchDeletionKeysByPattern,
    getOrSetCompressedCache,
    getTimeToLive,
    authenticate: () => {
      return true
    }
  }
}
