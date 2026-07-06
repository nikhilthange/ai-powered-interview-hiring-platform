const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const connectDB = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (retries < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000}s... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries + 1);
    }
    console.error('Max MongoDB retries reached. Exiting.');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

module.exports = connectDB;
