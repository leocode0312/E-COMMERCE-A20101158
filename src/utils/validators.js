const Joi = require('joi');

const emailValidation = Joi.string().email({
  tlds: { allow: ['com', 'net', 'pe', 'local'] }
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: emailValidation.required(),
  password: Joi.string().min(6).max(128).required()
});

const adminCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: emailValidation.required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'user').default('admin')
});

const loginSchema = Joi.object({
  email: emailValidation.required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, adminCreateSchema, loginSchema };
