const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  status: { type: String, enum: ['pending','paid','cancelled'], default: 'pending' },
  paymentInfo: { type: Object, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

