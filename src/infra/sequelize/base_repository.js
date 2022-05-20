class BaseRepository {
  constructor({ database }) {
    this.database = database;
  }
  create(data, modelName) {
    return this.database[modelName].create(data);
  }
  findAllBy(attributesArr, search, modelName) {
    return this.database[modelName].findAll({ attributes: attributesArr, where: search });
  }
  findAll(query, modelName) {
    return this.database[modelName].findAll({ where: { ...query } });
  }
  findBy(attributesArr, search, modelName) {
    return this.database[modelName].findOne({ attributes: attributesArr, where: search });
  }
  findOne(search, modelName) {
    return this.database[modelName].findOne({ where: search });
  }
  findAndCountAll(attributesArr, search, orderBy, modelName) {
    return this.database[modelName].findAndCountAll({ attributes: attributesArr, where: search, order: [[orderBy, 'DESC']] });
  }
  update(data, whereClause, modelName) {
    return this.database[modelName].update(data, { where: whereClause });
  }
  destroy(whereClause, modelName) {
    return this.database[modelName].update({ recordStatus: 0 }, { where: whereClause });
  }
}

module.exports = BaseRepository;
