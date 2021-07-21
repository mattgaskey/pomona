const Twig = require('twig');
const fs = require('fs');

/**
 * Return a list of font icons, for a listing.
 */
module.exports = function() {
  Twig.extendFunction('icon_list', (path) => {
    if (!path) {
      path = __dirname + '/../assets/font-svg';
    }
    var items = fs.readdirSync(path);
    return items
      .filter((item) => item.indexOf('.svg') >= 0)
      .map((item) => item.replace('.svg', ''))
  });
};