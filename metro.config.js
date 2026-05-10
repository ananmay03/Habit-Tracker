// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Local Expo modules in modules/ are auto-discovered by expo-modules-autolinking.
// No extra config needed here for now — keep this file minimal.

module.exports = config;
