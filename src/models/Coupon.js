const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent','fixed'], required: true },
  amount: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
