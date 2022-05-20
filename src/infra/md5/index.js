'use strict'

/**
 * Module dependencies.
 */
import cryptoRandomString from 'crypto-random-string'

/**
 * Calculates the MD5 hash of a string.
 *
 * @return {String}        - The MD5 hash.
 */
function md5 () {
  return cryptoRandomString(16)
}

module.exports = () => md5
