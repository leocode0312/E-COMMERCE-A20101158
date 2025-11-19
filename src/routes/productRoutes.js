// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');

// USERS
router.get('/', productController.list);
router.get('/:id', productController.get);

// ADMIN - crear/editar/eliminar/stock
router.post('/', auth.required, auth.adminOnly, productController.create);
router.put('/:id', auth.required, auth.adminOnly, productController.update);
router.delete('/:id', auth.required, auth.adminOnly, productController.remove);
router.patch('/:id/stock', auth.required, auth.adminOnly, productController.setStock);

module.exports = router;
