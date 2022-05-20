import morgan from 'morgan'

module.exports = ({ logger }) => {
  return morgan('common', {
    stream: {
      write: (message) => {
        logger.info(message.slice(0, -1))
      }
    }
  })
}
