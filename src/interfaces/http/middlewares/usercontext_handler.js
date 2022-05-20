import httpContext from 'express-cls-hooked';
const uuidv4 = require('uuid/v4');
module.exports = () => {
  return (req, res, next) => {
    httpContext.set('currentuser', req?.user);
    req.request_id = uuidv4();
    httpContext.set('request_id', req.request_id);
    httpContext.set('apiName', req.path);
    httpContext.set('reqBody', req.body);
    httpContext.set('reqQuery', req.query);
    httpContext.set('trackingCode', req?.query?.trackingCode);
    httpContext.set('userType', req.headers['x-user-type']);
    httpContext.set(
      'clientIP',
      (req.headers['x-forwarded-for'] || '')
        .split(',')
        .pop()
        .trim() || req.connection.remoteAddress
    );
    httpContext.set('user_agent', req.headers['user-agent']);
    httpContext.set('req_ip', req.ip);
    next();
  };
};
