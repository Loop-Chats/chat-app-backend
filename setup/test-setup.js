const db = require('../db');
const mongoose = require('mongoose');

// Connect to the DB before running tests
beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://root:password123@mongodb:27017/loopchatdb?authSource=admin';

  // Safety: ensure tests run against an explicit test database
  const isTestEnv = process.env.NODE_ENV === 'test' || /test/i.test(mongoUrl);
  if (!isTestEnv) {
    throw new Error('\nRefusing to run tests: MONGO_URL does not look like a test database.\n' +
      'Set NODE_ENV=test and use a dedicated test database (for example: mongodb://root:password123@mongodb:27017/loopchatdb_test?authSource=admin)\n' +
      'This prevents tests from deleting production data.');
  }

  process.env.MONGO_URL = mongoUrl; // ensure db module uses this
  await db.connect({});
});

// // Clear collections before each test
// beforeEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     try {
//       await collection.deleteMany({});
//     } catch (err) {
//       // ignore errors cleaning non-existent collections
//     }
//   }
// });

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
