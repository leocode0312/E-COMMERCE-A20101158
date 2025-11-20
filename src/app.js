const express = require('express');
require('express-async-errors');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/stripe') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

// Rutas
app.get('/', (req, res) => res.json({ ok: true, message: 'Ecommerce API - Librería' }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", require('./routes/cartRoutes'));
app.use("/api/orders", require('./routes/orderRoutes'));
app.use("/api/coupons", require('./routes/couponRoutes'));
app.use("/api/checkout", require("./routes/checkoutRoutes"));

// webhook path
app.use('/webhook', require('./routes/webhookRoutes'));

app.use(errorHandler);

module.exports = app;

