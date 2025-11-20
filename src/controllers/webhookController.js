const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Error verificando firma:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Detectar evento de pago completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (!orderId || !userId) {
      console.error("Metadata faltante en session");
      return res.status(400).json({ error: "Falta orderId o userId en metadata" });
    }

    console.log("Pago confirmado para orden:", orderId);

    // 3. Buscar orden
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      console.error("Orden no encontrada:", orderId);
      return res.status(404).end();
    }

    if (order.status === "paid") {
      console.log("Orden ya estaba marcada como pagada. Ignorando reintento.");
      return res.json({ received: true });
    }

    // 4. Marcar como pagada
    order.status = "paid";
    order.paymentInfo = {
      stripeSessionId: session.id,
      paidAt: new Date()
    };
    await order.save();

    // 5. Reducir stock
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // 6. Vaciar carrito del usuario
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], coupon: null }
    );

    console.log("Orden pagada, stock actualizado y carrito limpiado.");
  }

  res.json({ received: true });
};
