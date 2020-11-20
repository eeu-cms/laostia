const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hashPassword('password')
    ],
    update: [
      hashPassword('password')
    ],
    patch: [
      hashPassword('password')
    ],
    remove: []
  },

  after: {
    all: [
      protect('password'),
    ],
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
