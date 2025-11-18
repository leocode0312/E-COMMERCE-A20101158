require('dotenv').config();
const connectDB = require('../config/db');
const AuthService = require('../services/AuthService');
const User = require('../models/User');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

async function seed() {
  await connectDB();
  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin ya existe:', adminEmail);
      process.exit(0);
    }
    const admin = await AuthService.registerAdmin({ name: 'Admin Inicial', email: adminEmail, password: adminPassword, role: 'admin' });
    console.log('Admin creado:', admin);
    console.log('Cambia la contraseña del admin por defecto lo antes posible');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
