const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  mongoose.set('strictQuery', true);

  // Add connection options for better reliability
  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority'
  };

  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't crash immediately - allow server to start for quiz generation (which doesn't need DB)
    console.warn('Server will continue but quiz history and user features may not work');
    throw err; // Still throw so user knows there's an issue
  }
}

module.exports = connectDb;

