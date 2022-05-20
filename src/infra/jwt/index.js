import { sign, verify as _verify, decode as _decode } from 'jsonwebtoken'
import { compose, trim, replace, partialRight } from 'ramda'

module.exports = ({ config, redisClient }) => ({
  signin: (options) => (payload) => {
    const opt = Object.assign({}, options)
    const pData = {
      id: payload.id,
      type: payload.type
    }
    redisClient.setKey(payload.type + '_' + payload.id, payload)
    return sign(pData, config.authSecret, opt)
  },
  verify: (options) => (token) => {
    const opt = Object.assign({}, options)
    return _verify(token, config.authSecret, opt)
  },
  decode: (options) => (token) => {
    const opt = Object.assign({}, options)
    const decodeToken = compose(
      partialRight(_decode, [opt]),
      trim,
      replace(/JWT|jwt/g, '')
    )

    return decodeToken(token)
  },
  signInWithSignature: (options, signature) => (payload) => {
    const opt = Object.assign({}, options)
    const pData = {
      id: payload.id,
      type: payload.type
    }
    redisClient.setKey(payload.type + '_' + payload.id, payload)
    return sign(pData, signature, opt)
  }
})
