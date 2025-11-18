const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Crear administradores (solo admin)
router.post('/admin', auth.required, auth.adminOnly, authController.createAdmin);

module.exports = router;
