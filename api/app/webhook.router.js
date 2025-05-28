import express from 'express';

const createWebhookRouter = (webhookController) => {
	const router = express.Router();

	router.post('/order-update', (req, res) =>
		webhookController.handleOrderStatusUpdate(req, res),
	);

	// Rota para testar a conexão
	router.get('/health', (req, res) => {
		res.status(200).json({
			message: 'Webhook service is running',
			timestamp: new Date().toISOString(),
		});
	});

	return router;
};

export { createWebhookRouter };
