const { pathsToModuleNameMapper } = require('ts-jest');
const tsConfig = require('./tsconfig.json');

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',

	// this enables us to use tsconfig-paths with jest
	modulePaths: [tsConfig.compilerOptions.baseUrl],
	moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths),
};
