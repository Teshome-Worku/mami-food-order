const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

function redactUri(uri) {
  if (!uri) return uri;
  // hide credentials between // and @ if present
  return uri.replace(/:\/\/(.*)@/, '://<redacted>@');
}

const connectDB = async (opts = {}) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  const maxAttempts = opts.retries ?? 5;
  const delayMs = opts.delayMs ?? 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, { maxPoolSize: 10 });
      console.log('MongoDB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxAttempts) {
        console.error('All MongoDB connection attempts failed.');
        console.error('Connection string (redacted):', redactUri(uri));
        throw error;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
};

module.exports = connectDB;