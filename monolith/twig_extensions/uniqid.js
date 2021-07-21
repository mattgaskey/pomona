const Twig = require('twig');
const Uniq = require('uniqid');

module.exports = function() {
  Twig.extendFilter('uniqid', (str) => {
    return Uniq(str);
  });
};