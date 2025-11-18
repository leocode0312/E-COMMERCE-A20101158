const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no definido');
  await mongoose.connect(uri, { dbName: 'ecommerce' });
  console.log('MongoDB connected');
};

module.exports = connectDB;
