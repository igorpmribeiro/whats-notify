class OrderService {
	constructor(notificationService) {
		this.notificationService = notificationService;
	}

	async processOrderStatusUpdate(orderId, status, customer) {
		try {
			// Extract phone information
			const phoneData = customer.phone[0];
			const fullPhoneNumber = `55${phoneData.ddd}${phoneData.number}`;
			
			// Log processing information
			console.log(`Processing order ID: ${orderId}, Status: ${status.label}, Customer: ${customer.name}, Phone: ${fullPhoneNumber}`);

			// Create personalized message based on status label
			const message = this.createStatusMessage(orderId, status.label, customer.name);

			// Notify the customer about the order status update
			await this.notificationService.sendWhatsAppNotification(fullPhoneNumber, message);
		} catch (error) {
			console.error('Error processing order status update:', error);
			throw new Error('Failed to process order status update');
		}
	}

	createStatusMessage(orderId, statusLabel, customerName) {
		const greeting = customerName ? `Olá ${customerName}! ` : 'Olá! ';
		
		const statusMessages = {
			'Pendente': `🕐 ${greeting}Seu pedido #${orderId} está pendente e será processado em breve.`,
			'Aprovado': `✅ ${greeting}Seu pedido #${orderId} foi confirmado! Obrigado pela preferência.`,
			'Em preparo': `👨‍🍳 ${greeting}Seu pedido #${orderId} está sendo preparado com carinho.`,
			'Enviado': `🎉 ${greeting}Seu pedido #${orderId} já foi enviado e será entregue em sua residência em até 3 dias úteis.`,
			'Entregue': `📦 ${greeting}Seu pedido #${orderId} foi entregue. Esperamos que goste!`,
			'Cancelado': `❌ ${greeting}Seu pedido #${orderId} foi cancelado. Entre em contato conosco se tiver dúvidas.`,
			'Reservado': `📅 ${greeting}Seu pedido #${orderId} foi reservado e já aguarda pela sua retirada. Obrigado!`
		};

		return statusMessages[statusLabel] || `📋 ${greeting} Seu pedido ${orderId} foi atualizado e o novo status dele é ${statusLabel}`;
	}
}

export {OrderService};