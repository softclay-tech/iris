import httpContext from 'express-cls-hooked'

module.exports = () => {
  const hook = fn => (...args) => {
    const funcWithSession = fn(httpContext.get('currentuser'))
    return funcWithSession(...args)
  }

  return hook
}
