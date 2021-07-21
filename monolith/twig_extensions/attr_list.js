const Twig = require('twig');

module.exports = function() {
  // Takes an object describing key/value pairs for attributes on an
  // html tag, then returns a string suitable for spitting into the
  // tag.
  Twig.extendFilter('attr_list', (dict) => {
    var k, v, attr_pair = [];
    
    if (typeof dict == 'undefined') return '';
    for ([k, v] of Object.entries(dict)) {
      attr_pair.push(`${k.replace('_','-')}="${v}"`);
    }
    return attr_pair.join(' ');
  });

  // Takes an object describing key/value pairs for data attributes 
  // on an html tag, then returns a string suitable for spitting into 
  // the tag.
  Twig.extendFilter('data_list', (dict) => {
    var k, v, data_pair = [];

    if (typeof dict == 'undefined') return '';    
    for ([k, v] of Object.entries(dict)) {
      data_pair.push(`data-${k.replace('_','-')}="${v}"`);
    }
    return data_pair.join(' ');
  });
};