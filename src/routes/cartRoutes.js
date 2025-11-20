const router = require('express').Router();
const auth = require('../middlewares/auth');
const CartController = require('../controllers/cartController');

router.use(auth.required);

router.get('/', CartController.getCart);
router.post('/', CartController.addItem);
router.patch('/:itemId', CartController.updateItem);
router.delete('/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);
router.post('/apply-coupon', CartController.applyCoupon);

module.exports = router;

