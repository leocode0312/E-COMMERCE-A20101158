const Product = require('../models/Product');

class ProductService {
  async create(data) {
    return Product.create(data);
  }

  async list({ category, q, skip = 0, limit = 20, sort = '-createdAt' } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { author: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));

    return { total, products };
  }

  async getById(id) {
    return Product.findById(id);
  }

  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {

    const product = await Product.findById(id);

    if (!product) return null;

    await product.deleteOne();

    return product;
  }
  async setStock(id, stock) {
    const p = await Product.findById(id);
    if (!p) throw { status: 404, message: 'Producto no encontrado' };
    p.stock = stock;
    return p.save();
  }
}

module.exports = new ProductService();
