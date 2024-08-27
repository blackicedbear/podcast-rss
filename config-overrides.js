const path = require('path');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    timers: require.resolve('timers-browserify'),
    stream: require.resolve('stream-browserify'),
  };

  return config;
};
