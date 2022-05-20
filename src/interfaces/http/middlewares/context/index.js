const { get: healthCheckGetContext, put: healthCheckPutContext } = require('./healthCheckContext');


module.exports = {
  post: {
  },
  get: {
    ...healthCheckGetContext,
  },
  put: {
    ...healthCheckPutContext,
  },
  patch: {},
  delete: {
  },
};
