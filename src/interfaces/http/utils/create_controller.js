import { join } from 'path'

module.exports = (moduleName, controllerUri) => {
  const controllerPath = join(__dirname, '..', '..', '..', 'modules', moduleName, 'controller', controllerUri)
  const Controller = require(controllerPath)
  return Controller()
}
