module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*spec.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts'
  ]
}