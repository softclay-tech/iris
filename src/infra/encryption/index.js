import bcrypt from 'bcryptjs'

module.exports = () => {
  const encryptPassword = async (plainPassword, round) => {
    const salt = bcrypt.genSaltSync(round)
    return bcrypt.hashSync(plainPassword, salt)
  }

  const comparePassword = async (plainPassword, hash) => {
    return bcrypt.compareSync(plainPassword, hash)
  }

  return {
    encryptPassword,
    comparePassword
  }
}
