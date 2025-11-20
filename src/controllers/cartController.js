const CartService = require('../services/CartService');
const CouponService = require('../services/CouponService');

exports.getCart = async (req, res) => {
  const cart = await CartService.getCart(req.user.id);
  res.json(cart || { items: [] });
};

exports.addItem = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId requerido' });
  const cart = await CartService.addItem(req.user.id, productId, Number(quantity));
  res.status(201).json(cart);
};

exports.updateItem = async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;
  const cart = await CartService.updateItem(req.user.id, itemId, Number(quantity));
  res.json(cart);
};

exports.removeItem = async (req, res) => {
  const itemId = req.params.itemId;
  const cart = await CartService.removeItem(req.user.id, itemId);
  res.json(cart);
};

exports.clearCart = async (req, res) => {
  const cart = await CartService.clearCart(req.user.id);
  res.json(cart);
};

exports.applyCoupon = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Código de cupón requerido' });

  const cart = await CartService.getCart(req.user.id);
  if (!cart) return res.status(400).json({ message: 'Carrito vacío' });

  // calcular subtotal
  let subtotal = 0;
  for (const it of cart.items) subtotal += (it.product.price || 0) * it.quantity;

  const result = await CouponService.validateCoupon(code, subtotal);
  await CartService.applyCoupon(req.user.id, result.coupon._id);

  res.json({ message: 'Cupón aplicado', discount: result.discount, coupon: result.coupon });
};
