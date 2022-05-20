module.exports = {
  version: process.env.APP_VERSION,
  timezone: process.env.TIMEZONE,
  port: process.env.PORT,
  logging: {
    maxsize: 100 * 1024, // 100mb
    maxFiles: 2,
    colorize: false
  },
  authSecret: process.env.SECRET,
  authSession: {
    session: false
  },
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  SENDGRID_ACCOUNT_ONE_API_KEY: process.env.SENDGRID_ACCOUNT_ONE_API_KEY,
  AWS: {
    SQS: {
      APP_EVENT_SQS_NAME: process.env.APP_EVENT_SQS_NAME,
      JOB_SCHEDULER_EVENT_QUEUE: process.env.JOB_SCHEDULER_EVENT_QUEUE
    }
  },
  CANDIDATE_ASSETS_BUCKET_NAME: process.env.CANDIDATE_ASSETS_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  mongoDBConfig: {
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    certificate: process.env.MONGO_DB_CERTIFICATE,
    database: process.env.MONGO_DB_DATABASE,
    authStrategy: process.env.MONGO_DB_AUTH_STRATEGY,
    replicaSet: process.env.MONGO_DB_REPLICA_SET || null,
    poolSize: process.env.MONGO_DB_POOL_SIZE ? parseInt(process.env.MONGO_DB_POOL_SIZE, 10) : 25
  },
  algoliaConfig: {
    ALGOLIA_APPLICATION_KEY: process.env.ALGOLIA_APPLICATION_KEY,
    ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY
  }
}
