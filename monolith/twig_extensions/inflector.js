const Twig = require('twig');

module.exports = function() {
  Twig.extendFilter('titleize', (str) => {
    return str;
  });
};