const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async ensureUniqueEmail(email) {
    const exists = await User.findOne({ email });
    if (exists) throw { status: 409, message: 'El correo ya está registrado' };
  }

  // Registro role user
  async registerUser({ name, email, password }) {
    await this.ensureUniqueEmail(email);
    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

  // Crear admin
  async registerAdmin({ name, email, password, role = 'admin' }) {
    await this.ensureUniqueEmail(email);
    const user = new User({ name, email, password, role });
    await user.save();
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

  // Login: valida credenciales
  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw { status: 401, message: 'Credenciales inválidas' };
    const match = await user.comparePassword(password);
    if (!match) throw { status: 401, message: 'Credenciales inválidas' };

    const payload = { sub: user._id.toString(), role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    };
  }

  async getById(id) {
    return User.findById(id).select('-password');
  }
}

module.exports = new AuthService();
