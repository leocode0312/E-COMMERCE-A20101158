const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CouponService = require('./CouponService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class OrderService {

  // CREA ORDEN Y CREA LA SESIÓN DE CHECKOUT
  async createCheckoutSession(userId, successUrl, cancelUrl) {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('coupon');

    if (!cart || !cart.items.length)
      throw { status: 400, message: 'Carrito vacío' };

    // recalcular subtotal
    let subtotal = 0;
    for (const it of cart.items) {
      const product = await Product.findById(it.product._id);
      if (!product)
        throw { status: 404, message: `Producto ${it.product._id} no encontrado` };

      if (product.stock < it.quantity)
        throw { status: 400, message: `Producto ${product.title} sin stock suficiente` };

      subtotal += product.price * it.quantity;
    }

    let discount = 0;
    let couponId = null;

    if (cart.coupon) {
      const couponResult = await CouponService.validateCoupon(cart.coupon.code, subtotal);
      discount = couponResult.discount;
      couponId = couponResult.coupon._id;
    }

    const total = Math.max(0, subtotal - discount);

    // crear orden pending
    const created = await Order.create({
      user: userId,
      items: cart.items.map(it => ({
        product: it.product._id,
        title: it.product.title || it.product.name || '',
        quantity: it.quantity,
        price: it.product.price
      })),
      subtotal,
      discount,
      total,
      coupon: couponId,
      status: 'pending'
    });

    const order = created;

    const line_items = cart.items.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: it.product.title || it.product.name || 'Producto',
          description: it.product.description || ''
        },
        unit_amount: Math.round((it.product.price || 0) * 100)
      },
      quantity: it.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,

      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    return { order, sessionUrl: session.url, sessionId: session.id };
  }


  async handleSuccessfulPayment(session) {
    const orderId = session.metadata && session.metadata.orderId;
    if (!orderId) throw { status: 400, message: 'OrderId no encontrado en metadata' };

    const sessionDB = await mongoose.startSession();
    sessionDB.startTransaction();

    try {
      const order = await Order.findById(orderId).session(sessionDB);
      if (!order) throw { status: 404, message: 'Orden no encontrada' };

      if (order.status === 'paid') {
        await sessionDB.commitTransaction();
        sessionDB.endSession();
        return order;
      }

      // reducir stock
      for (const it of order.items) {
        const p = await Product.findById(it.product).session(sessionDB);
        if (!p) throw { status: 404, message: `Producto ${it.product} no encontrado` };

        if (p.stock < it.quantity)
          throw { status: 400, message: `Stock insuficiente para producto ${p.title}` };

        p.stock -= it.quantity;
        await p.save({ session: sessionDB });
      }

      order.status = 'paid';
      order.paymentInfo = {
        stripe: session,
        paidAt: new Date()
      };

      await order.save({ session: sessionDB });

      if (order.coupon) {
        await CouponService.incrementUse(order.coupon);
      }

      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [], coupon: null } }
      ).session(sessionDB);

      await sessionDB.commitTransaction();
      sessionDB.endSession();

      return order;

    } catch (err) {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      throw err;
    }
  }

  async getOrdersForUser(userId) {
    return Order.find({ user: userId }).populate('items.product');
  }

  async getOrderByIdForUser(orderId, userId) {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) throw { status: 404, message: 'Orden no encontrada' };
    if (order.user.toString() !== userId.toString())
      throw { status: 403, message: 'No autorizado' };
    return order;
  }
}

module.exports = new OrderService();
