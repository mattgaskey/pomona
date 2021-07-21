resolveConfig = require('tailwindcss/resolveConfig');

// Load our tailwind config file with any new values
tailwindConfig = require('/app/tailwind.config.js');

const fullConfig = resolveConfig(tailwindConfig);

// figure out the color map, which involves flattening nested colors
let colornames = [];
Object.entries(fullConfig.theme.colors).forEach(element => {
  if (typeof element[1] === "string") {
    colornames.push({
      name: element[0],
      value: element[1]
    });
  } else {
    const colorname = element[0];
    Object.entries(element[1]).forEach(v => {
      colornames.push({
        name: (v[0] !== 'default') ? `${colorname}-${v[0]}` : colorname,
        value: v[1]
      });
    });
  }
});

// Now changing the tailwind config should automatically update our padding demonstration page.
module.exports = {
  context: {
    "colors": colornames
  }
}

