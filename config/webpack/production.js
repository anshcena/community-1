/* global process, module, require */

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const environment = require('./environment');
const config = environment.toWebpackConfig();

// Inject the preact/devtools import into all the webpacker pack files (webpack entry points) that reference at least one Preact component
// so that Preact compoonents can be debugged with the Preact DevTools.
config.entry = Object.entries(config.entry).reduce(
  (previous, [entryPointName, entryPointFileName]) => {
    if (/\.jsx$/.test(entryPointFileName)) {
      previous[entryPointName] = ['preact/devtools', entryPointFileName];
    } else {
      previous[entryPointName] = entryPointFileName;
    }

    return previous;
  },
  {},
);

module.exports = config;
