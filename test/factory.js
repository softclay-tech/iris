
const { curry } = require('ramda')

const sequelize = app.resolve('database').sequelize

const models = (name) => app.resolve('database')[name]

const repositories = (name) => app.resolve(name)

const domains = (name) => app.resolve(name)

const services = (name) => app.resolve(name)

const values = (name) => app.resolve(name)

const repository = curry((repo, model, domain) => {
  return repo({ model, domain })
})

module.exports = {
  models,
  repositories,
  repository,
  domains,
  sequelize,
  services,
  values
}
