const { Router } = require('express')
const Status = require('http-status')
const container = require('src/container')

module.exports = () => {
  const router = Router()
  const {
    response: { Success, Fail }
  } = container.cradle
  const {
    eventService,
    logger
  } = container.cradle

  router.post(
    '/test',
    async (req, res, next) => {
      try {
        const {
          body
        } = req
        logger.info('Test Event Route')
        await eventService.testEvent(body);
        res.status(Status.OK).json(await Success('OK'))
      } catch (e) {
        next(e)
      }
    }
  )
  return router
}
