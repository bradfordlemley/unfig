'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('{{productionModule}}');
} else {
  module.exports = require('{{developmentModule}}');
}
