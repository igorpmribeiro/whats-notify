class WebhookController {
  constructor(orderService) {
    this.orderService = orderService;
  }

	async handleOrderStatusUpdate(req, res) {
		try {
			const { orderId, status, customer } = req.body;

			// Validate the incoming data
			if (!orderId || !status || !status.label || !customer || !customer.phone || !customer.phone[0]) {
				return res.status(400).json({ 
					error: 'Invalid data. Required: orderId, status.label, customer.phone[0] with ddd and number' 
				});
			}

			// Validate phone structure
			const phoneData = customer.phone[0];
			if (!phoneData.ddd || !phoneData.number) {
				return res.status(400).json({ 
					error: 'Invalid phone data. Required: ddd and number' 
				});
			}

			// Process the order status update
			await this.orderService.processOrderStatusUpdate(orderId, status, customer);

			// Send a success response
			return res.status(200).json({ 
				message: 'Order status updated and notification sent successfully',
				orderId,
				statusLabel: status.label 
			});
		} catch (error) {
			console.error('Error handling order status update:', error);
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}

export { WebhookController };