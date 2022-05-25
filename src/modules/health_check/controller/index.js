const { Router } = require('express')
const Status = require('http-status')
const container = require('src/container')

module.exports = () => {
  const router = Router()
  const {
    response: { Success, Fail }
  } = container.cradle
  const {
    healthCheckService
  } = container.cradle

  router.get(
    '/status',
    async (req, res, next) => {
      try {
        const result = await healthCheckService.getState()
        if (result === 'ACTIVE') {
          res.status(Status.OK).json(await Success(result))
        } else {
          res.status(Status.INTERNAL_SERVER_ERROR).json(await Fail(result))
        }
      } catch (e) {
        next(e)
      }
    }
  )

  router.put(
    '/status',
    async (req, res, next) => {
      try {
        const { body } = req
        const result = await healthCheckService.updateState(body.status)
        res.status(Status.OK).json(await Success(result))
      } catch (e) {
        next(e)
      }
    }
  )
  return router
}
