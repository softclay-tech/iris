const { intersection } = require('ramda')

module.exports = ({ CustomError, constants: { UNAUTHORIZED_REQUEST } }) => (
  roles = []
) => {
  if (typeof roles === 'string') {
    roles = [roles]
  }
  return (req, res, next) => {
    if (roles.length && !req.user.user_roles.some(role => roles.includes(role.roles.name))) {
      throw new CustomError(
        UNAUTHORIZED_REQUEST.code,
        UNAUTHORIZED_REQUEST.status
      )
    }
    next()
  }
}
