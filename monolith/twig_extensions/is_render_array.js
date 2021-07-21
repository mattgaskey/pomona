const Twig = require('twig');

module.exports = function() {
  // Conditional for distinguishing between twig include for subcomponent vs. Drupal render array
  // In fractal, for now, just assume it's not Drupal-style
  Twig.extendFunction('is_render_array', (build) => {
    return false;
  });
};