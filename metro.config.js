// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// add .csv as a valid asset extension
config.resolver.assetExts.push('csv');

module.exports = config;

