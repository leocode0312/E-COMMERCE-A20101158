const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.required = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ message: "No autorizado" });

    const parts = header.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res
        .status(401)
        .json({ message: "Formato de token inválido" });

    const token = parts[1];

    // Verificar y decodificar token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en BD
    const user = await User.findById(payload.sub).select("email role isActive");

    if (!user)
      return res
        .status(401)
        .json({ message: "Usuario no encontrado o eliminado" });

    if (!user.isActive)
      return res
        .status(403)
        .json({ message: "Cuenta deshabilitada, contacte al administrador" });

    
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token inválido o expirado" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "No autorizado" });

  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Acceso restringido: requiere rol admin" });

  next();
};
