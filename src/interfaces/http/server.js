const express = require('express')

module.exports = ({ config, router, logger, auth }) => {
  const app = express()
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With, content-type, browsertimezone, Authorization'
    )
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
  })
  app.disable('x-powered-by')
  app.use(auth.initialize())
  app.use(router)
  app.use(express.static('public'))

  return {
    app,
    start: () =>
      new Promise(resolve => {
        const http = app.listen(config.port, () => {
          const { port } = http.address()
          logger.info(`🤘 API === Port ${port} :: Environment === ${process.env.NODE_ENV}`)
        })
        const io = require('socket.io')(http)
        io.on('connection', function (socket) {
          console.log('a user connected')
        })
      })
  }
}
