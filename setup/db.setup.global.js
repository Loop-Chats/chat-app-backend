const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// --- GLOBAL SETUP (Called ONCE before all tests) ---
module.exports = async function globalSetup() {
    // 1. Create a new in-memory instance of MongoDB
    const mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    // 2. Connect Mongoose to the in-memory DB
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    // Store the mongo instance and URI globally for the teardown hook and other setup files.
    // This is how Jest persists data between the setup/teardown phases.
    global.__MONGO_URI__ = uri;
    global.__MONGO_INSTANCE__ = mongo;
};

// --- GLOBAL TEARDOWN (Called ONCE after all tests) ---
// This is necessary to fix the "Worker process failed to exit gracefully" error.
module.exports.globalTeardown = async function globalTeardown() {
    if (global.__MONGO_INSTANCE__) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await global.__MONGO_INSTANCE__.stop();
    }
};

// We also need the `clear` function for beforeEach hooks:
module.exports.clear = async function clear() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};