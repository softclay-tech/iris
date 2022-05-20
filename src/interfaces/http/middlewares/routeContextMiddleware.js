const { includes, hasPath, path } = require('ramda');
const { pathToRegexp } = require('path-to-regexp');
const { OK } = require('http-status');
const Schemas = require('./context');

const _supportedMethods = ['post', 'put', 'get', 'patch', 'delete'];

module.exports = ({ response: { Success } }) => () =>
  // eslint-disable-next-line consistent-return
  async (req, res, next) => {
    const sanitizedRoute = req.path.lastIndexOf('/') === req.path.length - 1 ? req.path.substring(0, req.path.lastIndexOf('/')) : req.path;
    const route = sanitizedRoute.replace('/api', '');
    const method = req.method.toLowerCase();
    let _schema = null;
    const extraParams = {};
    if (_supportedMethods.includes(method)) {
      const methodObj = Schemas[method];
      for (const key in methodObj) {
        if (Object.prototype.hasOwnProperty.call(methodObj, key)) {
          const element = methodObj[key];
          const regexp = pathToRegexp(key);
          const match = regexp.exec(route);
          if (match) {
            _schema = element || element;
            let matchCounter = 0;
            key.split('/').forEach(routeItem => {
              if (routeItem.startsWith(':')) {
                matchCounter++;
                extraParams[route.replaceAll(':', '')] = match[matchCounter];
              }
            });
            break;
          }
        }
      }
    }
    if (includes(method, _supportedMethods) && (_schema || hasPath([method, route], Schemas))) {
      // get schema for the current route
      if (!_schema) {
        const _currentRouteschema = path([method, route], Schemas);
        _schema = _currentRouteschema;
      }
      let validateBody;
      if (Array.isArray(req.body)) {
        validateBody = req.body;
      } else {
        validateBody = { ...req.query, ...req.body, ...req.params, ...extraParams };
      }
      req.params = Object.assign(req.params, extraParams);
      req.resource = _schema;
      req.validateBody = validateBody;
      if (req.headers['x-request-id'] && req.resouerce.actionName === 'CREATE_TRANSACTION') {
        // save it in dynamodb for now
        const data = {};
        if (!!data) {
          return res.status(OK).send(Success(data.data));
        }
      }
    }
    next();
  };
