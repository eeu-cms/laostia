// Application hooks that run for every service
const commonHooks = require('feathers-hooks-common');
const authorize = require('./hooks/abilities');
const authenticate = require('./hooks/authenticate');

const { when } = commonHooks;

module.exports = {
  before: {
    all: [
      when(
        (hook) => {
          return hook.params.provider && `/${hook.path}` !== hook.app.get('authentication').path;
        },
        authenticate,
        authorize()
      ),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
