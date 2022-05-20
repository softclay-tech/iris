import { resolve } from 'src/container'
import moment from 'moment'

moment.tz.setDefault('UTC')
moment.tz.link('Asia/Calcutta|Asia/Kolkata')
const app = resolve('app')
app
  .start()
  .catch((error) => {
    app.logger.error(error.stack)
    process.exit()
  })
