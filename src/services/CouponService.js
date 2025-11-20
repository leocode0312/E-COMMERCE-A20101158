const Coupon = require('../models/Coupon');

class CouponService {
  async getByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase(), active: true });
  }

  async validateCoupon(code, subtotal) {
    const coupon = await this.getByCode(code);
    if (!coupon) throw { status: 404, message: 'Cupón no válido' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw { status: 400, message: 'Cupón expirado' };
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) throw { status: 400, message: 'Cupón agotado' };
    if (subtotal < (coupon.minAmount || 0)) throw { status: 400, message: `El cupón requiere un monto mínimo de ${coupon.minAmount}` };

    let discount = 0;
    if (coupon.type === 'percent') discount = subtotal * (coupon.amount / 100);
    else discount = coupon.amount;

    return { coupon, discount };
  }

  async incrementUse(couponId) {
    if (!couponId) return;
    return Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { new: true });
  }
}

module.exports = new CouponService();
