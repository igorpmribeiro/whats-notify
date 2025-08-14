class OrderService {
	constructor(notificationService, ProductService) {
		this.notificationService = notificationService;
		this.productService = ProductService;
		// Cache para evitar processamento duplicado do mesmo pedido/status
		this.processedOrders = new Map();
		this.cacheTimeout = 60000; // 1 minuto
	}

	// Gerar chave única para o processamento
	generateProcessKey(orderId, statusLabel, customerPhone) {
		return `${orderId}_${statusLabel}_${customerPhone}`;
	}

	// Verificar se o pedido já foi processado recentemente
	isRecentlyProcessed(processKey) {
		const now = Date.now();
		const lastProcessed = this.processedOrders.get(processKey);

		if (lastProcessed && now - lastProcessed < this.cacheTimeout) {
			return true;
		}

		// Limpar entradas antigas periodicamente
		if (this.processedOrders.size > 100) {
			let cleanedCount = 0;
			for (const [key, timestamp] of this.processedOrders.entries()) {
				if (now - timestamp > this.cacheTimeout) {
					this.processedOrders.delete(key);
					cleanedCount++;
				}
			}
			if (cleanedCount > 0 && process.env.NODE_ENV !== 'production') {
				console.log(`🧹 Cleaned ${cleanedCount} old order(s) from cache`);
			}
		}

		return false;
	}

	async processOrderStatusUpdate(orderId, status, customer) {
		try {
			// Validar dados de entrada
			if (!orderId || !status?.label || !customer?.phone?.[0]) {
				throw new Error('Invalid order data: missing required fields');
			}

			// Extract phone information
			const phoneData = customer.phone[0];
			if (!phoneData.ddd || !phoneData.number) {
				throw new Error('Invalid phone data: missing ddd or number');
			}

			const fullPhoneNumber = `55${phoneData.ddd}${phoneData.number}`;
			
			// Verificar se este pedido/status já foi processado recentemente
			const processKey = this.generateProcessKey(
				orderId,
				status.label,
				fullPhoneNumber,
			);
			
			if (this.isRecentlyProcessed(processKey)) {
				if (process.env.NODE_ENV !== 'production') {
					console.log(
						`⚠️ Order ${orderId} with status "${status.label}" already processed recently - skipping`,
					);
				}
				return { success: true, skipped: true, reason: 'recently_processed' };
			}

			// Não enviar mensagem para pedidos cancelados
			if (status.label === 'CANCELADO') {
				if (process.env.NODE_ENV !== 'production') {
					console.log(
						`⚠️ Order ${orderId} with status "CANCELADO" - not sending notification`,
					);
				}
				return { success: true, skipped: true, reason: 'status_cancelado' };
			}

			// Log simplificado apenas em desenvolvimento
			if (process.env.NODE_ENV !== 'production') {
				console.log(
					`📋 Processing: Order #${orderId} | Status: ${status.label} | Customer: ${customer.name}`,
				);
			}

			// Get Product Name
			const productName = await this.productService.getProductName(orderId);

			// Create personalized message based on status label
			const message = this.createStatusMessage(
				orderId,
				status.label,
				customer.name,
				productName,
			);

			// Notify the customer about the order status update
			const result = await this.notificationService.sendWhatsAppNotification(
				fullPhoneNumber,
				message,
			);

			// Marcar como processado se a mensagem foi enviada com sucesso
			if (result.success && !result.skipped) {
				this.processedOrders.set(processKey, Date.now());
			}

			return result;
		} catch (error) {
			console.error(`❌ Error processing order ${orderId}:`, error.message);
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
		const productList = productNames
			.map((product) => `• ${product}`)
			.join('\n');
		return `\n${productList}`;
	}

	createStatusMessage(orderId, statusLabel, customerName, productName) {
		const greeting = customerName ? `Olá ${customerName}! ` : 'Olá! ';
		const formattedProducts = this.formatProductNames(productName);

		const statusMessages = {
			RESERVADO: `📋 ${greeting}Sua reserva foi feita com sucesso!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}

⏰ O produto ficará reservado até o próximo dia útil.
📞 Para cancelar a reserva, entre em contato pelo WhatsApp.

⚠️ *ATENÇÃO: Produtos reservados e não retirados nos impedem de atender outros lojistas.*`,

			'AGUARDANDO PAGAMENTO': `🕦 ${greeting}Seu pedido foi recebido e está aguardando o pagamento.

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
💰 *Status:* ${statusLabel}`,

			PAGO: `✅ ${greeting}Seu pedido teve o pagamento confirmado!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
💚 *Status:* ${statusLabel}`,

			'PEDIDO RETIRADO': `🎉 ${greeting}Seu pedido já foi retirado. Agradecemos pela preferência!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
✅ *Status:* ${statusLabel}`,

			'EM ASSISTÊNCIA': `🛠️ ${greeting}Seu pedido encontra-se em assistência.

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
🔧 *Status:* ${statusLabel}

📞 Caso precise falar com o nosso setor de assistência, entre em contato pelo WhatsApp (21) 99756-7219`,

			'RESERVA CONFIRMADA': `🎉 ${greeting}Seu pedido está com a reserva confirmada!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
✅ *Status:* ${statusLabel}

📞 Para cancelar a reserva, entre em contato pelo WhatsApp.

⚠️ *ATENÇÃO: Produtos reservados e não retirados nos impedem de atender outros lojistas.*`,
		};

		return (
			statusMessages[statusLabel] ||
			`📋 ${greeting}Seu pedido foi atualizado!

🔢 *Pedido:* #${orderId}
📦 *Produto(s):* ${formattedProducts}
🔄 *Novo status:* ${statusLabel}`
		);
	}

	// Método para obter estatísticas do cache (útil para monitoramento)
	getCacheStats() {
		const now = Date.now();
		let activeOrders = 0;
		let expiredOrders = 0;

		for (const [key, timestamp] of this.processedOrders.entries()) {
			if (now - timestamp < this.cacheTimeout) {
				activeOrders++;
			} else {
				expiredOrders++;
			}
		}

		return {
			totalCached: this.processedOrders.size,
			activeOrders,
			expiredOrders,
			timeoutMinutes: this.cacheTimeout / 60000,
		};
	}
}

export { OrderService };
