const Twig = require('twig'); 

module.exports = function() {
  // Catch legacy usage of fake from old PHP / Patternlab
  Twig.extendFunction('yetimg',({w, h, tag, filter, ratio}) => {
    var image_width, image_height, image_ratio, rw, rh, rest, qual = '';

    const allowedRatios = ['1:1', '4:3', '3:2', '16:9', '3:4', '2:3', '9:16'];
    const passedWidth = typeof w !== 'undefined' && Number.isInteger(w) && w > 0;
    const passedHeight = typeof h !== 'undefined' && Number.isInteger(h) && h > 0;
    const passedTag = typeof tag !== 'undefined';
    const passedFilter = typeof filter !== 'undefined';
    const passedRatio = (typeof ratio !== 'undefined') && (allowedRatios.indexOf(ratio) != -1); 

    image_width = (passedWidth) ? w : 800;
    image_height = (passedHeight) ? h : 600; 
  
    if ( passedRatio ) {
      image_ratio = (passedRatio) ? ratio : '1:1';
      [rw,rh,rest] = image_ratio.split(':');
      
      if (passedHeight) {
        image_width = Math.round(image_height * ((rw + 0)/(rh + 0)));
      } else {
        image_height = Math.round(image_width * ((rh + 0)/(rw + 0)));
      }
    }

    if (passedTag && passedFilter) {
      qual = `/${tag}/${filter}`;
    } else if (passedFilter && !passedTag) {
      qual = `/*/${filter}`;
    } else if (!passedFilter && passedTag) {
      qual = `/${tag}`;
    }

    return `https://magicyeti.us/${image_width}/${image_height}${qual}`;
  });
  
};