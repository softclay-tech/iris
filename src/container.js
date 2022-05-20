import {
  createContainer,
  asFunction,
  asValue,
  Lifetime,
  InjectionMode,
  asClass
} from 'awilix'
import {
  scopePerRequest
} from 'awilix-express'

import app from './app'
import server from './interfaces/http/server'
import router from './interfaces/http/router'
import auth from './interfaces/http/auth'
import config from '../config'
import logger from './infra/logging'

import database from './infra/database'
import jwt from './infra/jwt'
import response from './infra/support/response'
import healthCheckService from './infra/health-check'
import axiosWrapper from './infra/support/axios_wrapper'
import constants from './constants'
import CustomError from './infra/error'
import transactionDecorator from './infra/transaction'
import sessionHook from './infra/hook'
import md5 from './infra/md5'
import passwordEncryption from './infra/encryption'
import loggerMiddleware from './interfaces/http/middlewares/http_logger'
import errorHandlerMiddleware from './interfaces/http/middlewares/error_handler'
import authorizeHandlerMiddleware from './interfaces/http/middlewares/authorize_handler'
import validatorMiddleware from './interfaces/http/middlewares/validationMiddleware'
import userContextMiddleware from './interfaces/http/middlewares/usercontext_handler'
import awsService from './infra/aws'
import mongoDBConn from './infra/no-sql-database/index.js'
import redis from './infra/caching'
import baseRepo from './infra/sequelize/base_repository'
import baseRepositoryV2 from './infra/sequelize/base_v2_repository'
const routeContextMiddleware = require('./interfaces/http/middlewares/routeContextMiddleware')
const container = createContainer({
  injectionMode: InjectionMode.PROXY
})

// System
container
  .register({
    app: asFunction(app).singleton(),
    server: asFunction(server).singleton()
  })
  .register({
    router: asFunction(router).singleton(),
    logger: asFunction(logger).singleton()
  })
  .register({
    config: asValue(config),
    constants: asValue(constants)
  })

// Middlewares
container
  .register({
    loggerMiddleware: asFunction(loggerMiddleware).singleton()
  })
  .register({
    containerMiddleware: asValue(scopePerRequest(container)),
    errorHandlerMiddleware: asFunction(errorHandlerMiddleware),
    authorizeMiddleware: asFunction(authorizeHandlerMiddleware).singleton()
  })
  .register({
    routeContextMiddleware: asFunction(routeContextMiddleware).singleton(),
    userContextMiddleware: asFunction(userContextMiddleware).singleton(),
    validatorMiddleware: asFunction(validatorMiddleware).singleton(),
    baseRepo: asClass(baseRepo).singleton(),
    baseRepositoryV2: asFunction(baseRepositoryV2).singleton()
  })
// Database
container.register({
  mongoDBConn: asFunction(mongoDBConn).singleton(),
  database: asFunction(database).singleton(),
  redisClient: asFunction(redis).singleton()
})

// Infra
container.register({
  auth: asFunction(auth).singleton(),
  jwt: asFunction(jwt).singleton(),
  response: asFunction(response).singleton(),
  healthCheckService: asFunction(healthCheckService).singleton(),
  axiosWrapper: asFunction(axiosWrapper).singleton(),
  CustomError: asFunction(CustomError).singleton(),
  awsService: asFunction(awsService).singleton(),
  md5: asFunction(md5).singleton(),
  passwordEncryption: asFunction(passwordEncryption).singleton(),
  transactionDecorator: asFunction(transactionDecorator).singleton(),
  sessionHook: asFunction(sessionHook).singleton()
})

container.loadModules(['modules/**/repository/*.js'], {
  resolverOptions: {
    register: asFunction,
    lifetime: Lifetime.SINGLETON
  },
  cwd: __dirname
})

container.loadModules(['infra/**/no-sql-db-model/*.js'], {
  resolverOptions: {
    register: asFunction,
    lifetime: Lifetime.SINGLETON
  },
  cwd: __dirname
})

container.loadModules(['modules/**/service/*.js'], {
  resolverOptions: {
    register: asFunction,
    lifetime: Lifetime.SINGLETON
  },
  cwd: __dirname
})
module.exports = container
