// Initializes the `products-categories` service on path `/products-categories`
const { ProductsCategories } = require('./products-categories.class');
const createModel = require('../../models/products-categories.model');
const hooks = require('./products-categories.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/products-categories', new ProductsCategories(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('products-categories');

  service.hooks(hooks);
};
