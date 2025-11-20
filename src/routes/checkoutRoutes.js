const router = require("express").Router();
const auth = require("../middlewares/auth");
const CheckoutController = require("../controllers/checkoutController");

router.use(auth.required);

// crear sesión de pago
router.post("/create-session", CheckoutController.createSession);

module.exports = router;
