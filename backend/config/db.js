const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (
      !process.env.MONGODB_URI ||
      process.env.MONGODB_URI.includes('not_configured') ||
      process.env.MONGODB_URI.includes('your_connection_string') ||
      process.env.MONGODB_URI.includes('<db_password>')
    ) {
      throw new Error('MONGODB_URI is not configured');
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
