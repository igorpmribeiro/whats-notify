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

	// Rota para verificar estatísticas dos caches (prevenção de duplicatas)
	router.get('/cache-stats', (req, res) => {
		try {
			const orderStats = webhookController.orderService.getCacheStats();
			const notificationStats = webhookController.orderService.notificationService.getCacheStats();
			
			res.status(200).json({
				message: 'Cache statistics',
				timestamp: new Date().toISOString(),
				orderCache: orderStats,
				messageCache: notificationStats,
			});
		} catch (error) {
			res.status(500).json({
				error: 'Failed to retrieve cache statistics',
				message: error.message,
			});
		}
	});

	return router;
};

export { createWebhookRouter };
