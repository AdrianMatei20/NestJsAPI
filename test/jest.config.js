const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest', // Use ts-jest for TypeScript support
  testEnvironment: 'node', // Set the test environment to Node.js
  rootDir: '.', // Look for tests in the 'src' directory
  modulePaths: ["<rootDir>/src"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }), // Resolve TypeScript paths
  moduleFileExtensions: ['ts', 'js', 'json'], // Recognize these file extensions
  testRegex: '.*\\.spec\\.ts$', // Use the naming convention for test files
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transpile TypeScript files
  },
  collectCoverageFrom: ['**/*.{ts,js}'], // Include all TS/JS files for coverage
  coverageDirectory: '../coverage', // Coverage report output directory
};
