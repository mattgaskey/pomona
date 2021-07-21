const Twig = require('twig');

module.exports = function() {
  // Takes an object describing key/value pairs for attributes on an
  // html tag, then returns a string suitable for spitting into the
  // tag.
  Twig.extendFilter('machine_name', (str) => {
    return str.replace(/[^A-Za-z0-9_]+/g,'-').toLowerCase();
  });
};