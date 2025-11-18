const AuthService = require('../services/AuthService');
const { registerSchema, adminCreateSchema, loginSchema } = require('../utils/validators');

exports.register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await AuthService.registerUser(value);
  res.status(201).json({ user });
};

exports.login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const result = await AuthService.login(value);
  res.json(result);
};

// Ruta protegida: solo admins pueden crear otros admins
exports.createAdmin = async (req, res) => {
  const { error, value } = adminCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await AuthService.registerAdmin({ ...value, role: 'admin' });
  res.status(201).json({ user });
};
