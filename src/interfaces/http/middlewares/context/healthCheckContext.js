const MODULE = 'HEALTH';

module.exports = {
  get: {
    '/V1/health/status': {
      module: MODULE,
      isApplicationHeadersRequired: false,
      actionName: 'HEALTH_CHECK',
      description: 'Get health check status of server',
    },
  },
  put: {
    '/V1/health/status': {
      module: MODULE,
      isApplicationHeadersRequired: false,
      actionName: 'UPDATE_HEALTH_CHECK',
      description: 'Update health check of server',
    },
  },
};
