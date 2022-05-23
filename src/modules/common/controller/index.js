const { Router } = require('express')
const Status = require('http-status')
const container = require('src/container')

module.exports = () => {
  const router = Router()
  const {
    response: { Success, Fail }
  } = container.cradle
  const {
    commonUtilService,
    logger
  } = container.cradle

  router.post(
    '/sendMessage',
    async (req, res, next) => {
      try {
        logger.info(`common controller`)
        await commonUtilService.sendMessageToQueue();
        res.status(Status.OK).json(await Success('OK'))
      } catch (e) {
        next(e)
      }
    }
  )

  return router
}
