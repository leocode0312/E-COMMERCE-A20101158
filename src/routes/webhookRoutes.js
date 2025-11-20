const router = require('express').Router();
const WebhookController = require('../controllers/webhookController');
router.post('/stripe', WebhookController.handleStripeWebhook);

module.exports = router;
