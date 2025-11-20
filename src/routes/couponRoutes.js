const router = require('express').Router();
const auth = require('../middlewares/auth');
const Coupon = require('../models/Coupon');

router.post('/validate', auth.required, async (req, res) => {
  const { code } = req.body;
  const CouponService = require('../services/CouponService');
  const CartService = require('../services/CartService');
  const cart = await CartService.getCart(req.user.id);
  let subtotal = 0;
  if (cart && cart.items) {
    for (const it of cart.items) subtotal += (it.product.price || 0) * it.quantity;
  }
  const result = await CouponService.validateCoupon(code, subtotal);
  res.json(result);
});

// Crear cupón - solo admin
router.post('/', auth.required, auth.adminOnly, async (req, res) => {
  const { code, type, amount, minAmount, expiresAt, maxUses } = req.body;
  const c = await Coupon.create({ code, type, amount, minAmount, expiresAt, maxUses });
  res.status(201).json(c);
});

module.exports = router;

