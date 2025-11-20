const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
  }

  async addItem(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) throw { status: 404, message: 'Producto no encontrado' };
    if (product.stock < quantity) throw { status: 400, message: 'Producto agotado o cantidad mayor al stock' };

    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find(i => i.product.toString() === productId.toString());
    if (item) {
      const newQty = item.quantity + quantity;
      if (product.stock < newQty) throw { status: 400, message: 'Cantidad solicitada supera el stock disponible' };
      item.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    return cart;
  }

  async updateItem(userId, itemId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) throw { status: 404, message: 'Item no encontrado en el carrito' };

    const product = await Product.findById(item.product);
    if (!product) throw { status: 404, message: 'Producto no encontrado' };
    if (product.stock < quantity) throw { status: 400, message: 'Cantidad solicitada supera el stock disponible' };

    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId, itemId) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) throw { status: 404, message: 'Item no encontrado en el carrito' };
    item.remove();
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    return cart;
  }

  async applyCoupon(userId, couponId) {
    const cart = await this.getOrCreateCart(userId);
    cart.coupon = couponId;
    await cart.save();
    return cart;
  }

  async getCart(userId) {
    return Cart.findOne({ user: userId }).populate('items.product').populate('coupon');
  }
}

module.exports = new CartService();
