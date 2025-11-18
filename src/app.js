const express = require('express');
require('express-async-errors');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, message: 'Ecommerce API - Librería' }));

app.use(errorHandler);

module.exports = app;
