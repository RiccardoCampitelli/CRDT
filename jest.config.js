// const { pathsToModuleNameMapper } = require('ts-jest/utils');

// const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["jest-extended"],
};
