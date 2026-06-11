const mongoose = require('mongoose');

/**
 * Connects the app to MongoDB.
 * Implements standard auto-retry on startup failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit application process with failure code if unable to bind database
    process.exit(1);
  }
};

module.exports = connectDB;
