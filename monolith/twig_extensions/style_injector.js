/* This filter is used to inject inline styles into a specific html tag when the tags 
   are embedded in a larger bit of text -- for example, in a wysiwig editor. If you are 
   writing the tag itself, you can use attr_list for the same effect.
   Why would you want to do this? Only because you are using Drupal to generate
   HTML email.  */

const Twig = require('twig');

module.exports = function() {
  // Takes an object describing key/value pairs for attributes on an
  // html tag, then returns a string suitable for spitting into the
  // tag.
  Twig.extendFilter('style_injector', (str, params) => {
    const [tag,styles] = params;
    const regex = '(<\\s*'+ tag +'\s*)([^>]*>)';
    return str.replace(new RegExp(regex,"g"),'$1 style="' + styles + '" $2');
  });
};