class ProductWebhookController {
	constructor(productBroadcastService) {
		this.productBroadcastService = productBroadcastService;
	}

	async handleProductChanged(req, res) {
		try {
			const { product_id, type } = req.body;

			// Validar o tipo do evento
			if (type !== 'product-changed') {
				return res.status(200).json({
					message: 'Event type ignored',
					type,
				});
			}

			// Validar product_id
			if (!product_id) {
				return res.status(400).json({
					error: 'Invalid payload. Required: product_id',
				});
			}

			console.log(`📩 Webhook recebido: product-changed (ID: ${product_id})`);

			// Processar o broadcast de forma assíncrona (responde rápido ao webhook)
			const result =
				await this.productBroadcastService.broadcastNewProduct(product_id);

			return res.status(200).json({
				message: 'Product broadcast processed',
				productId: product_id,
				sent: result.sent,
				failed: result.failed,
				total: result.total,
			});
		} catch (error) {
			console.error('❌ Product webhook error:', error.message);
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}

export { ProductWebhookController };
