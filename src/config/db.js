const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI no definido');

    await mongoose.connect(uri, {
      dbName: 'ecommerce',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    throw err; 
  }
};

module.exports = connectDB;

