const Joi = require('joi');

module.exports = {
  userSchema: Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(10).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]+$'))
  }),
}
