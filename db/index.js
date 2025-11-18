const mongoose = require('mongoose');

// Prefer a full connection string provided via MONGO_URL (set in docker-compose)
// Fallback to constructing from individual parts (DATABASE_HOST, DATABASE_PORT, etc.)
function getMongoUrl() {
  if (process.env.MONGO_URL) return process.env.MONGO_URL;

  const user = process.env.MONGO_INITDB_ROOT_USERNAME;
  const pass = process.env.MONGO_INITDB_ROOT_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT || '27017';

  if (!host) {
    throw new Error('DATABASE_HOST is not set. Set MONGO_URL or DATABASE_HOST/DATABASE_PORT and credentials.');
  }

  if (user && pass) {
    return `mongodb://${user}:${pass}@${host}:${port}`;
  }

  // No credentials provided — return simple host:port URL
  return `mongodb://${host}:${port}`;
}

function connect(options = {}) {
  const mongoUrl = getMongoUrl();

  const opts = Object.assign({
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // poolSize, socketTimeoutMS, etc. if needed
  }, options);

  return mongoose.connect(mongoUrl, opts)
    .then((conn) => {
      console.log('MongoDB connected:', mongoUrl);
      return conn;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}

module.exports = { connect, mongoose };