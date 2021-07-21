const Twig = require('twig'); 
const Fake = require('faker');

module.exports = function() {
  // Catch legacy usage of fake from old PHP / Patternlab
  Twig.extendFunction('fake',(what,...args) => {
    const m = what.split('.');
    if (m.length == 2) {
      const fn  = Fake[m[0]][m[1]]
      if (typeof fn === "function") {
        return fn(...args);
      }
    }
    return 'fake(' + what + ') is not implemented. Edit /twig_extensions/faker.js';
  });
  
};