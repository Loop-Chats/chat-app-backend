module.exports = {
  // Use jsdom for environment unless you have specific Node features needed
  testEnvironment: 'node', 
  
  // The directory where Jest will look for test files
  roots: ['<rootDir>/tests'],
  
  // Maximum time a single test is allowed to run before failure (ms)
  testTimeout: 30000, 

  // Uses real MongoDB service from docker-compose
  setupFilesAfterEnv: ['./setup/test-setup.js'],
};