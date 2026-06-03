const path = require("path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withUniwindConfig } = require("uniwind/metro");

// Monorepo metro config
//
// Fixes "Invalid hook call" caused by Metro resolving multiple copies of React
// (e.g. `apps/mobile/node_modules/react` vs `<workspace>/node_modules/react`).

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

config.resolver = config.resolver ?? {};

config.resolver.nodeModulesPaths = [
  ...new Set([
    ...(config.resolver.nodeModulesPaths ?? []),
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ]),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo-router": path.resolve(workspaceRoot, "node_modules/expo-router"),
  react: path.resolve(workspaceRoot, "node_modules/react"),
  "react-dom": path.resolve(workspaceRoot, "node_modules/react-dom"),
  "react-native": path.resolve(workspaceRoot, "node_modules/react-native"),
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
});
