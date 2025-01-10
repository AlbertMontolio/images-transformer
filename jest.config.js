
const config = {
  collectCoverageFrom: ['**/*.(t|j)s'],
  rootDir: 'src', // Set the root directory to 'src'
  testEnvironment: 'node', // Default test environment
  transform: {
    '^.+\\.ts$': 'ts-jest', // Use ts-jest to transform TypeScript files
  },
  moduleFileExtensions: ['ts', 'js', 'json'], // Recognize these file types
  coverageDirectory: '../coverage', // Store coverage reports outside 'src'
  testMatch: ['**/*.spec.ts', '**/*.test.ts'], // Test file patterns
  coveragePathIgnorePatterns: [
    'coverage',
    'config',
    'test',
    'dist'
  ],
};

export default config;
