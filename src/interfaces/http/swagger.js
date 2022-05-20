const { contains, isNil } = require('ramda');

const schemas = require('src/interfaces/http/middlewares/context');
const j2s = require('joi-to-swagger');

const _getSchemas = (apiFullPath, apiMethod) => {
  let parametersArr = {};
  let [authRequired, deprecated, summary, module, description] = [null, null, null, null, null];
  for (const [schemApiMethod, schemaObj] of Object.entries(schemas)) {
    for (const [schemaApiPath, singleSchemaObj] of Object.entries(schemaObj)) {
      if (singleSchemaObj && apiFullPath === schemaApiPath && apiMethod === schemApiMethod) {
        authRequired = !!isNil(singleSchemaObj?.authRequired);
        deprecated = singleSchemaObj?.deprecated;
        summary = singleSchemaObj?.summary;
        module = singleSchemaObj?.module;
        description = singleSchemaObj?.description;
        if (singleSchemaObj?.schema) {
          const { swagger } = j2s(singleSchemaObj?.schema);
          parametersArr = swagger;
          return { parametersArr, authRequired, deprecated, summary, module, description };
        }
      }
    }
  }
  return { parametersArr, authRequired, deprecated, summary, module, description };
};

const _sanitizeRoute = route => {
  const regex = /(\/api(.*)\/\?)/gm;
  let m;
  /* eslint-disable */
  while ((m = regex.exec(route)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    // The result can be accessed through the `m`-variable.
    let currIndex = -1;
    m.forEach(() => {
      currIndex++;
    });
    return m[currIndex];
  }
  return;
};

const _getDataDogOrExpressRouteStack = apiRouter => (apiRouter.handle._datadog_orig ? apiRouter.handle._datadog_orig.stack : apiRouter.handle.stack);

const _getController = router => {
  const paths = {};
  const apiRouter = router.stack.find(elem => elem.name === 'router');
  const apiRouteList = Object.values(_getDataDogOrExpressRouteStack(apiRouter));
  const filterRouterList = apiRouteList.filter(elem => elem.name === 'router');
  for (const singleRoute of filterRouterList) {
    const sanitizeRoute = _sanitizeRoute(singleRoute.regexp.toString().replace(/\\/g, ''));
    const routeStack = _getDataDogOrExpressRouteStack(singleRoute);
    for (const stack of routeStack) {
      let [parameters, requestBody] = [[], {}];
      if (stack.route) {
        let apiFullPath = stack.route.path.length === 1 ? sanitizeRoute : sanitizeRoute + stack.route.path;
        const apiMethod = Object.keys(stack.route.methods)[0];
        const schema = _getSchemas(apiFullPath, apiMethod);
        const resourceLiteral = schema.module || 'MISCELLANEOUS';
        const description = schema.description || '';
        if (contains(apiMethod, ['put', 'post', 'patch', 'delete'])) {
          if (schema.parametersArr) {
            requestBody = schema.parametersArr;
          }
        }
        if (contains(apiMethod, ['get', 'delete'])) {
          if (Object.keys(schema.parametersArr).length) {
            for (let [field, fieldSchema] of Object.entries(schema.parametersArr.properties)) {
              const required = false;
              const isRequired = schema.parametersArr?.properties?.required?.includes(field);
              if (isRequired !== undefined) {
                required = isRequired;
              }
              parameters.push({ name: field, in: 'query', required, schema: fieldSchema });
            }
          }
        }
        if (apiFullPath.indexOf(':') >= 0) {
          const apiUrlSplit = apiFullPath.split('/');
          for (const [index, apiPath] of apiUrlSplit.entries()) {
            if (apiPath.indexOf(':') > -1) {
              const pathParam = apiPath.replace(':', '');
              parameters.push({ name: pathParam, in: 'path', required: true, schema: { type: 'string' } });
              apiPath = `{${pathParam}}`;
              apiUrlSplit[index] = apiPath;
            }
          }
          apiFullPath = apiUrlSplit.join('/');
        }
        if (!paths[apiFullPath]) {
          paths[apiFullPath] = {};
        }
        paths[apiFullPath][apiMethod] = { tags: [resourceLiteral], description, responses: { default: { description: 'OK' } } };
        schema && schema.authRequired && (paths[apiFullPath][apiMethod].security = [{ bearerAuth: [] }]);
        schema && schema.deprecated && (paths[apiFullPath][apiMethod].deprecated = schema.deprecated);
        parameters && parameters.length > 0 && (paths[apiFullPath][apiMethod].parameters = parameters);
        requestBody &&
          Object.keys(requestBody).length &&
          (paths[apiFullPath][apiMethod].requestBody = { content: { 'application/json': { schema: requestBody } } });
      }
    }
  }
  return paths;
};

const generateSwaggerDoc = router => {
  const routes = _getController(router);
  const doc = {
    openapi: '3.0.1',
    info: {
      title: 'SOFT CLAY V1 SWAGGER',
      version: 'V2',
      contact: { name: 'kamlehshpaliwalsoft', email: 'kamlesh.paliwal@softclay.in' },
    },
    servers: [{ description: `${process.env.NODE_ENV.substring(0, 3)} server (beta)`, url: '/api' }],
    paths: routes,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
  };
  return doc;
};
module.exports = {
  generateSwaggerDoc,
};
