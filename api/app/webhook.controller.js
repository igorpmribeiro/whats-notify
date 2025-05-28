class WebhookController {
	constructor(orderService) {
		this.orderService = orderService;
	}

	async handleOrderStatusUpdate(req, res) {
		try {
			const { orderId, status, customer } = req.body;

			// Validate the incoming data
			if (
				!orderId ||
				!status ||
				!status.label ||
				!customer ||
				!customer.phone ||
				!customer.phone[0]
			) {
				return res.status(400).json({
					error:
						'Invalid data. Required: orderId, status.label, customer.phone[0] with ddd and number',
				});
			}

			// Validate phone structure
			const phoneData = customer.phone[0];
			if (!phoneData.ddd || !phoneData.number) {
				return res.status(400).json({
					error: 'Invalid phone data. Required: ddd and number',
				});
			}

			// Process the order status update
			const result = await this.orderService.processOrderStatusUpdate(
				orderId,
				status,
				customer,
			);

			// Send a success response with additional info
			const response = {
				message: 'Order status updated and notification processed',
				orderId,
				statusLabel: status.label,
				processed: !result?.skipped,
			};

			if (result?.skipped) {
				response.skippedReason = result.reason;
			}

			return res.status(200).json(response);
		} catch (error) {
			console.error(`❌ Webhook error for order ${req.body.orderId}:`, error.message);
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}

export { WebhookController };
