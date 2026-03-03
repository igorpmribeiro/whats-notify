import { Router } from 'express';

const createProductWebhookRouter = (productWebhookController) => {
	const router = Router();

	router.post('/product-changed', (req, res) =>
		productWebhookController.handleProductChanged(req, res),
	);

	router.get('/health', (req, res) => {
		res.status(200).json({
			message: 'Product webhook service is running',
			timestamp: new Date().toISOString(),
		});
	});

	return router;
};

export { createProductWebhookRouter };
