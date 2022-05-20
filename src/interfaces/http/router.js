import statusMonitor from 'express-status-monitor'
import cors from 'cors'
import {
  json,
  urlencoded
} from 'body-parser'
import compression from 'compression'
import {
  Router
} from 'express'
import controller from './utils/create_controller'
import httpContext from 'express-cls-hooked'
import multipart from 'connect-multiparty'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
const swaggerUi = require('swagger-ui-express')
const {
  generateSwaggerDoc
} = require('./swagger')

module.exports = ({
  config,
  containerMiddleware,
  loggerMiddleware,
  errorHandlerMiddleware,
  validatorMiddleware,
  routeContextMiddleware
}) => {
  const router = Router()
  if (config.env === 'development') {
    router.use(statusMonitor())
  }

  if (config.env !== 'test') {
    router.use(loggerMiddleware)
  }
  // Create Main Router
  const apiRouter = Router()

  // Register Middleware
  apiRouter
    .use(
      cors({
        origin: [config.clientEndPoint],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
      })
    )
    .use(
      urlencoded({
        extended: false
      })
    )
    .use(multipart())
    .use(json())
    .use(compression())
    .use(helmet())
    .use(mongoSanitize())
    .use(httpContext.middleware)
    .use(containerMiddleware)

  apiRouter.use(routeContextMiddleware())
  apiRouter.use(validatorMiddleware())

  /**
   * Health Controller
   */

  apiRouter.use(`/api/V1/health`, controller('health_check', 'index'))


  router.use(`/`, apiRouter)
  // Register Error Handler
  router.use(errorHandlerMiddleware)
  process.env.NODE_ENV && process.env.NODE_ENV !== 'production' && router.use('/docs', swaggerUi.serve, swaggerUi.setup(generateSwaggerDoc(router)))
  return router
}
