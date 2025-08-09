const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

// 1. Create a simple metro config
const config = getDefaultConfig(__dirname);

// 2. Resolve the root directory - going up two levels from apps/mobile
const projectRoot = path.resolve(__dirname);
const workspaceRoot = path.resolve(projectRoot, '../..');

// 3. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 4. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 5. Force Metro to resolve (sub)dependencies consistently
config.resolver.disableHierarchicalLookup = true;

// 6. Explicitly add extraNodeModules for problematic packages
config.resolver.extraNodeModules = {
  '@expo/metro-runtime': path.resolve(workspaceRoot, 'node_modules/@expo/metro-runtime')
};

module.exports = config;