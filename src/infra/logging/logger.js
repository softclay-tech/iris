import { existsSync, mkdirSync } from 'fs'
import { createLogger, transports as _transports, format } from 'winston'

if (!existsSync(`logs`)) {
  mkdirSync(`logs`)
}

module.exports = ({ config }) => {
  return createLogger({
    format: format.combine(
      format.splat(),
      format.errors({ stack: true }),
      format.timestamp(),
      format.json()
    ),
    transports: [
      new _transports.Console(),
      new _transports.File(
        Object.assign(config.logging, {
          filename: `logs/${config.env}.log`
        })
      )
    ]
  })
}
