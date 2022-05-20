module.exports = ({ database }) => {
  const sequelize = database.sequelize

  const transaction = fn => async (...args) =>
    sequelize.transaction(t => {
      return fn(...args)
    })

  return {
    transaction: transaction
  }
}
