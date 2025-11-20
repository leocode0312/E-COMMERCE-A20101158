const OrderService = require('../services/OrderService');

exports.createCheckout = async (req, res) => {
  const successUrl = process.env.CLIENT_SUCCESS_URL || req.body.successUrl || 'http://localhost:3000/success';
  const cancelUrl = process.env.CLIENT_CANCEL_URL || req.body.cancelUrl || 'http://localhost:3000/cancel';

  const { order, sessionUrl, sessionId } = await OrderService.createCheckoutSession(req.user.id, successUrl, cancelUrl);
  // Devuelve la url de Stripe Checkout al Postman
  res.status(201).json({ orderId: order._id, checkoutUrl: sessionUrl, sessionId });
};

exports.getMyOrders = async (req, res) => {
  const orders = await OrderService.getOrdersForUser(req.user.id);
  res.json(orders);
};

exports.getOrder = async (req, res) => {
  const order = await OrderService.getOrderByIdForUser(req.params.id, req.user.id);
  res.json(order);
};

exports.myPurchases = async (req, res) => {
  const orders = await OrderService.getOrdersForUser(req.user.id);
  const products = [];
  for (const o of orders) {
    for (const it of o.items) {
      products.push({ product: it.product, title: it.title, quantity: it.quantity });
    }
  }
  res.json(products);
};
