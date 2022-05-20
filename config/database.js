import { resolve } from 'path'
const dotEnvPath = resolve('.env')
/**
 * since mocha don't see environment variables we have to use dotenv
 */
require('dotenv').config({ path: dotEnvPath })
module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    dialect: 'mysql',
    define: {
      freezeTableName: true,
      underscored: true
    },
    replication: {
      read: { host: process.env.READ_REPLICA_DATABASE_HOST },
      write: { host: process.env.DATABASE_HOST }
    },
    pool: {
      max: 30,
      min: 0,
      acquire: 1000000,
      idle: 10000
    },
    sync: true
  },
  test: {
    username: process.env.DATABASE_TEST_USERNAME,
    password: process.env.DATABASE_TEST_PASSWORD,
    database: process.env.DATABASE_TEST_NAME,
    host: process.env.DATABASE_TEST_HOST,
    dialect: 'mysql',
    define: {
      underscored: true
    },
    dialectOptions: {
      useUTC: true // -->Add this line. for reading from database
    },
    sync: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  staging: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    dialect: 'mysql',
    define: {
      underscored: true
    },
    dialectOptions: {
      useUTC: true // -->Add this line. for reading from database
    },
    replication: {
      read: [{ host: process.env.READ_REPLICA_DATABASE_HOST }],
      write: { host: process.env.DATABASE_HOST }
    },
    sync: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    dialect: 'mysql',
    define: {
      underscored: true
    },
    replication: {
      read: [
        { host: process.env.READ_REPLICA_DATABASE_HOST },
        { host: process.env.DATABASE_HOST }
      ],
      write: { host: process.env.DATABASE_HOST }
    },
    dialectOptions: {
      useUTC: true // -->Add this line. for reading from database
    },
    sync: false,
    pool: {
      max: 60,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}
