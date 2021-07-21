resolveConfig = require('tailwindcss/resolveConfig');

// Load our tailwind config file with any new values
tailwindConfig = require('/app/tailwind.config.js');

//import resolveConfig from 'tailwindcss/resolveConfig'
//import tailwindConfig from './tailwind.config.js'
//const fullConfig = resolveConfig(tailwindConfig)

const fullConfig = resolveConfig(tailwindConfig);

const spacing = Object.entries(fullConfig.theme.spacing).map((v) => {
  const [name,value] = v;
  return { name, value };
});

module.exports = {
  context: {
    spacing: spacing
  }
}