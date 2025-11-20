const CheckoutService = require("../services/CheckoutService");

exports.createSession = async (req, res) => {
  const session = await CheckoutService.createSession(req.user.id);
  return res.json({ url: session.url });
};
