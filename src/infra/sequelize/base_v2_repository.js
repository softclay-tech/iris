import {
  define
} from 'src/containerHelper'
module.exports = define('baseRepositoryV2', ({
  database
}) => {
  const create = function (data, modelName) {
    return database[modelName || this.defaultModelName].create(data)
  }
  const findAllBy = function (attributesArr, search, modelName) {
    return database[modelName || this.defaultModelName].findAll({
      attributes: attributesArr,
      where: {
        recordStatus: 1,
        ...search
      }
    })
  }
  const findAll = function (query, modelName) {
    return database[modelName || this.defaultModelName].findAll({
      where: {
        recordStatus: 1,
        ...query
      }
    })
  }
  const findBy = function (attributesArr, search, modelName) {
    return database[modelName || this.defaultModelName].findOne({
      attributes: attributesArr,
      where: search
    })
  }
  const findOne = function (search, modelName) {
    return database[modelName || this.defaultModelName].findOne({
      where: {
        recordStatus: 1,
        ...search
      }
    })
  }
  const findAndCountAll = function (attributesArr, search, orderBy, modelName) {
    return database[modelName || this.defaultModelName].findAndCountAll({
      attributes: attributesArr,
      where: {
        recordStatus: 1,
        ...search
      },
      order: [
        [orderBy, 'DESC']
      ]
    })
  }
  const update = function (data, whereClause, modelName) {
    return database[modelName || this.defaultModelName].update(data, {
      where: whereClause
    })
  }
  const destroy = function (whereClause, modelName) {
    return database[modelName || this.defaultModelName].update({
      recordStatus: 0
    }, {
      where: whereClause
    })
  }
  const getModel = function (modelName) {
    return database[modelName || this.defaultModelName]
  }

  const increment = function (colName, incrementBy, whereClause, modelName) {
    return database[modelName || this.defaultModelName].increment(colName, { by: incrementBy, where: { recordStatus: 1, ...whereClause } })
  }
  return (defaultModelName) => {
    const modelProto = {
      defaultModelName
    }
    return ({
      getModel: getModel.bind(modelProto),
      create: create.bind(modelProto),
      findAllBy: findAllBy.bind(modelProto),
      findAll: findAll.bind(modelProto),
      findBy: findBy.bind(modelProto),
      findOne: findOne.bind(modelProto),
      findAndCountAll: findAndCountAll.bind(modelProto),
      update: update.bind(modelProto),
      destroy: destroy.bind(modelProto),
      increment: increment.bind(modelProto)
    })
  }
})
