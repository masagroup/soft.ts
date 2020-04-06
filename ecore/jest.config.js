module.exports = {
  setupFiles: [
    "<rootDir>/jest-ts-auto-mock.config.ts"
  ],
  globals: {
    "ts-jest": {
      "compiler": "ttypescript"
    }
  },
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testEnvironment: 'node',
  testRegex: '.*\\.(test|spec)?\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
