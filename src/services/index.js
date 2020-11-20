const users = require('./users/users.service.js');
const products = require('./products/products.service.js');
const orders = require('./orders/orders.service.js');
const productsCategories = require('./products-categories/products-categories.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(products);
  app.configure(orders);
  app.configure(productsCategories);
};
