const assert = require('assert');
const app = require('../../src/app');

describe('\'products-categories\' service', () => {
  it('registered the service', () => {
    const service = app.service('products-categories');

    assert.ok(service, 'Registered the service');
  });
});
