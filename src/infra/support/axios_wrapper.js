const axios = require('axios')
const FormData = require('form-data')
module.exports = () => {
  const get = async (uri, params, headers) => axios.get(uri, {headers })

  const post = async (uri, postBody, headers) => axios.post(uri, postBody, { headers })

  const put = async (uri, postBody, headers) => axios.put(uri, postBody, { headers })

  const formUrlEncodedPost = async (url, postBody, headers = {}) => {
    // const formData = generateFormURLEncodedStringFromObject(postBody)
    const options = {
      method: 'POST',
      headers: { 'Content-Type': `application/x-www-form-urlencoded;charset=UTF-8`, ...headers },
      data: postBody,
      url
    }
    return axios(options)
  }
  const generateFormURLEncodedStringFromObject = obj => Object.entries(obj).map((key, val) => `${key}=${encodeURIComponent(val)}`).join('&')

  const generateURIStringFromObject = (uri, obj) => {
    const params = new URLSearchParams(obj);
    uri = `${uri}?${params.toString()}`
    return uri
  }

  const postMultipartFormData = async (url, postBody = {}, headers = {}) => {
    const form = new FormData()
    for (const [key, value] of Object.entries(postBody)) {
      if(key === 'file')
      {
        form.append(`${key}`, value.fileBuf, value.filename)

      }
      else form.append(`${key}`, value)
    }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data', ...form.getHeaders(), ...headers },
      data: form,
      url
    }
    return axios(options)
  }
  return {
    get,
    post,
    put,
    formUrlEncodedPost,
    generateFormURLEncodedStringFromObject,
    generateURIStringFromObject,
    postMultipartFormData
  }
}
