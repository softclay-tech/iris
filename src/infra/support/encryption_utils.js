import Cryptr from 'cryptr'
import base64 from 'base-64'
const cryptr = new Cryptr('khbakjdfbkjbdjfioqhwiop')

const encrypt = code => {
  var encryptedString = cryptr.encrypt(code)
  return encryptedString
}

const decrypt = code => {
  var decryptedString = cryptr.decrypt(code)
  return decryptedString
}

const base64Encode = string => {
  var toBase64 = base64.encode(string)
  return toBase64
}

const responseEncode = string => {
  var toBase64 = base64.encode(JSON.stringify(string))
  return toBase64
}
const base64Decode = string => {
  var toString = base64.decode(string)
  return toString
}

module.exports = {
  encrypt,
  decrypt,
  base64Encode,
  base64Decode,
  responseEncode
}
