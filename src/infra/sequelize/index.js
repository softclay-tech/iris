import { basename as _basename, join } from 'path';
import Sequelize from 'sequelize';
import cls from 'continuation-local-storage';
import { operatorsAliases } from './operatorAlias';
import { readdirSync } from 'fs';
import httpContext from 'express-cls-hooked';
const fs = require('fs');
const CircularJSON = require('circular-json');
const decamelize = require('decamelize');

const namespace = cls.createNamespace('transaction-namespace');
Sequelize.useCLS(namespace);
const basename = _basename(__filename);
module.exports = ({ config, basePath, logger }) => {
  let sequelize;
  const db = {};
  db.models = {};
  const Op = Sequelize.Op;
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], {
      operatorsAliases: operatorsAliases(Op),
      ...config,
    });
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      operatorsAliases: operatorsAliases(Op),
      ...config,
      logging: str => {
        logger.info(CircularJSON.stringify(str));
      },
    });
  }

  sequelize.addHook('beforeDefine', attributes => {
    Object.keys(attributes).forEach(key => {
      if (typeof attributes[key] !== 'function') {
        attributes[key].field = decamelize(key);
      }
    });
  });

  const dir = join(basePath, './models');

  readdirSync(dir)
    .filter(file => {
      return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach(file => {
      const model = sequelize['import'](join(dir, file));
      db[model.name] = model;
    });

  const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

  const dirs = [];
  const modulePath = join(__dirname, '/../../modules');
  const allDirs = getDirectories(modulePath);

  allDirs.forEach(m => {
    dirs.push(join(modulePath, m, '/dbmodel'));
  });
  for (const i in dirs) {
    const dir = dirs[i];
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir)
      .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
      })
      .forEach(file => {
        const model = sequelize['import'](join(dir, file));
        db[model.name] = model;
      });
  }
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName]['created_by'] = {
        type: Sequelize.UUID,
      };
      db[modelName]['updated_by'] = {
        type: Sequelize.UUID,
      };
      db[modelName].addHook('beforeCreate', (schema, options) => {
        const loggedInUserId = httpContext.get('currentuser')?.id ? httpContext.get('currentuser').id : null;
        if (loggedInUserId) {
          !schema.createdBy && schema.setDataValue('createdBy', loggedInUserId);
          !schema.updatedBy && schema.setDataValue('updatedBy', loggedInUserId);
        }
      });
      db[modelName].addHook('beforeBulkUpdate', (schema, options) => {
        const loggedInUserId = httpContext.get('currentuser')?.id ? httpContext.get('currentuser').id : null;
        if (loggedInUserId) {
          if (schema.fields.includes('updatedBy') || schema.fields.includes('updated_by')) {
            schema.fields.push('updatedBy');
            schema.attributes.updatedBy = loggedInUserId;
          }
        }
      });
      db[modelName].associate(db);
    }
  });
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};
