const ProductService = require('../services/ProductService');
const { createProductSchema, updateProductSchema, updateStockSchema } = require('../utils/productValidators');

exports.create = async (req, res) => {
  const { error, value } = createProductSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const product = await ProductService.create(value);
  res.status(201).json(product);
};

exports.list = async (req, res) => {
  const { category, q, skip, limit, sort } = req.query;
  const result = await ProductService.list({ category, q, skip, limit, sort });
  res.json(result);
};

exports.get = async (req, res) => {
  const product = await ProductService.getById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(product);
};

exports.update = async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const updated = await ProductService.update(req.params.id, value);
  if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(updated);
};

exports.remove = async (req, res) => {
  const removed = await ProductService.delete(req.params.id);
  if (!removed) 
    return res.status(404).json({ message: 'Producto no encontrado' });

  return res.json({ 
    message: 'Producto eliminado correctamente',
    deletedProduct: removed
    });
};


exports.setStock = async (req, res) => {
  const { error, value } = updateStockSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const updated = await ProductService.setStock(req.params.id, value.stock);
  res.json(updated);
};
