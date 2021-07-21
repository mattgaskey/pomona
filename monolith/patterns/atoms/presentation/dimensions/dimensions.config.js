resolveConfig = require('tailwindcss/resolveConfig');

// Load our tailwind config file with any new values
tailwindConfig = require('/app/tailwind.config.js');

const fullConfig = resolveConfig(tailwindConfig);

const maxWidths = Object.entries(fullConfig.theme.maxWidth).map((v) => {
  const [name,value] = v;
  return { name, value };
});

const widths = Object.entries(fullConfig.theme.width).map((v) => {
  const [name,value] = v;
  return { name, value };
});

const maxHeights = Object.entries(fullConfig.theme.maxHeight).map((v) => {
  const [name,value] = v;
  return { name, value };
});

const heights = Object.entries(fullConfig.theme.height).map((v) => {
  const [name,value] = v;
  return { name, value };
});

module.exports = {
  context: {
    maxWidth: maxWidths,
    width: widths,
    maxHeight: maxHeights,
    height: heights
  }
}
