const router = require('express').Router();
const auth = require('../middlewares/auth');
const OrderController = require('../controllers/orderController');

router.use(auth.required);

router.post('/checkout', OrderController.createCheckout); // crea orden pending + stripe session
router.get('/my', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrder);
router.get('/purchases', OrderController.myPurchases);

module.exports = router;
