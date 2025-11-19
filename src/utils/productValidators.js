const Joi = require('joi');

const createProductSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().allow('').max(200),
  description: Joi.string().allow('').max(2000),
  category: Joi.string().min(1).max(100).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().allow('')
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  author: Joi.string().max(200),
  description: Joi.string().max(2000),
  category: Joi.string().max(100),
  price: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  image: Joi.string().uri().allow('')
}).min(1);

const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required()
});

module.exports = { createProductSchema, updateProductSchema, updateStockSchema };
