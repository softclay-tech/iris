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
    eventBodyValidateService,
    logger
  } = container.cradle

  router.post(
    '/sendMessage',
    async (req, res, next) => {
      try {
        logger.info(`common controller`)
        let {eventName= "", data = {}} = req.body;
        await commonUtilService.sendMessageToQueue({eventName, data});
        res.status(Status.OK).json(await Success('OK'))
      } catch (e) {
        next(e)
      }
    }
  )

  router.get(
    '/validateBody',
    async (req, res, next) => {
      try {
        logger.info(`common controller`)
        await eventBodyValidateService.validateEventObj({
          username: 'abc',
          password: 'abc123'
        });
        res.status(Status.OK).json(await Success('OK'))
      } catch (e) {
        next(e)
      }
    }
  )

  return router
}
