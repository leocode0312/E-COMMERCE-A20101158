const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/Cart");
const Order = require("../models/Order");

class CheckoutService {

  async createSession(userId) {
    // Cargar carrito
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0)
      throw { status: 400, message: "El carrito está vacío" };

    // Calcular total con cupón
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.quantity * item.product.price;
    }

    let discountAmount = 0;

    if (cart.coupon) {
      discountAmount = subtotal * (cart.coupon.discountPercentage / 100);
    }

    const total = subtotal - discountAmount;

    // Crear orden en estado pendiente
    const order = await Order.create({
      user: userId,
      items: cart.items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
        price: i.product.price
      })),
      total,
      status: "pending",
      coupon: cart.coupon ? cart.coupon.code : null
    });

    // Crear checkout session simulada en Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
      line_items: cart.items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.product.title },
          unit_amount: item.product.price * 100
        },
        quantity: item.quantity
      })),
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    return session;
  }
}

module.exports = new CheckoutService();
