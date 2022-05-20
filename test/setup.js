import request from 'supertest';
import { expect } from 'chai';
import container, { resolve } from 'src/container';
const moment = require('moment');
moment.tz.setDefault('UTC');
const server = resolve('server');
const config = resolve('config');
const logger = resolve('logger');
const constants = resolve('constants');
const eventService = resolve('eventService');
const jobSchedulerService = resolve('jobSchedulerService');

logger.silent(false);

global.expect = expect;
global.app = container;

global.request = request(server.app);
global.config = config;
global.constants = constants;
