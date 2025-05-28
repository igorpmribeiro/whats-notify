class OrderService {
	constructor(notificationService, ProductService) {
		this.notificationService = notificationService;
		this.productService = ProductService;
	}

	async processOrderStatusUpdate(orderId, status, customer) {
		try {
			// Extract phone information
			const phoneData = customer.phone[0];
			const fullPhoneNumber = `55${phoneData.ddd}${phoneData.number}`;
			
			// Log processing information
			console.log(`Processing order ID: ${orderId}, Status: ${status.label}, Customer: ${customer.name}, Phone: ${fullPhoneNumber}`);

			// Get Product Name
			const productName = await this.productService.getProductName(orderId);
		// Create personalized message based on status label
		const message = this.createStatusMessage(orderId, status.label, customer.name, productName);

			// Notify the customer about the order status update
			await this.notificationService.sendWhatsAppNotification(fullPhoneNumber, message);
		} catch (error) {
			console.error('Error processing order status update:', error);
			throw new Error('Failed to process order status update');
		}
	}

	// Helper function to format product names nicely
	formatProductNames(productNames) {
		if (!productNames || productNames.length === 0) {
			return 'seus produtos';
		}
		
		if (productNames.length === 1) {
			return `"${productNames[0]}"`;
		}
		
		if (productNames.length === 2) {
			return `"${productNames[0]}" e "${productNames[1]}"`;
		}
		
		// For 3 or more products, use a bullet list format
		const productList = productNames.map(product => `• ${product}`).join('\n');
		return `\n${productList}`;
	}

	createStatusMessage(orderId, statusLabel, customerName, productName) {
		const greeting = customerName ? `Olá ${customerName}! ` : 'Olá! ';
		const formattedProducts = this.formatProductNames(productName);
		
		const statusMessages = {
			'RESERVADO': `📋 ${greeting}Sua reserva foi feita com sucesso!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}

⏰ O produto ficará reservado até o próximo dia útil.
📞 Para cancelar a reserva, entre em contato pelo WhatsApp.

⚠️ *ATENÇÃO: Produtos reservados e não retirados nos impedem de atender outros lojistas.*`,

			'AGUARDANDO PAGAMENTO': `🕦 ${greeting}Seu pedido foi recebido e está aguardando o pagamento.

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
💰 *Status:* Aguardando pagamento`,

			'PAGO': `✅ ${greeting}Seu pedido teve o pagamento confirmado!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
💚 *Status:* Pagamento confirmado`,

			'PEDIDO RETIRADO': `🎉 ${greeting}Seu pedido já foi retirado. Agradecemos pela preferência!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
✅ *Status:* Retirado com sucesso`,

			'EM ASSISTÊNCIA': `🛠️ ${greeting}Seu pedido encontra-se em assistência.

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
🔧 *Status:* Em assistência técnica

📞 Caso precise falar com o nosso setor de assistência, entre em contato pelo WhatsApp (21) 99756-7219`,

			'RESERVA CONFIRMADA': `🎉 ${greeting}Seu pedido está com a reserva confirmada!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
✅ *Status:* Reserva confirmada

📞 Para cancelar a reserva, entre em contato pelo WhatsApp.

⚠️ *ATENÇÃO: Produtos reservados e não retirados nos impedem de atender outros lojistas.*`,

			'Cancelado': `❌ ${greeting}Seu pedido foi cancelado.

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
🚫 *Status:* Cancelado`
		};

		return statusMessages[statusLabel] || `📋 ${greeting}Seu pedido foi atualizado!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
🔄 *Novo status:* ${statusLabel}`;
	}
}

export {OrderService};