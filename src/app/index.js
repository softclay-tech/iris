/**
 * We want to start here so we can manage other infrastructure
 * database
 * express server
 */
module.exports = ({
  server,
  database,
  logger,
  eventInitService
}) => {
  return {
    start: () =>
      Promise.resolve()
        // .then(database.sequelize.sync({ force: true }))
        .then(database.sequelize.authenticate())
        .then(eventInitService.init())
        .then(server.start),
    logger
  }
}
