class INotificationService {
	sendWhatsAppNotification(phoneNumber, message) {
		throw new Error('Method not implemented');
	}
}

class WhatsNotificationService extends INotificationService {
	constructor(whatsAppClient) {
		super();
		this.whatsAppClient = whatsAppClient;
		// Cache para evitar mensagens duplicadas
		this.sentMessages = new Map();
		this.messageTimeout = 30000; // 30 segundos
	}

	// Gerar hash da mensagem para evitar duplicatas
	generateMessageHash(phoneNumber, message) {
		const content = `${phoneNumber}:${message}`;
		return content.length + '_' + content.slice(0, 50).replace(/\s/g, '');
	}

	// Verificar se a mensagem já foi enviada recentemente
	isDuplicateMessage(hash) {
		const now = Date.now();
		const lastSent = this.sentMessages.get(hash);

		if (lastSent && now - lastSent < this.messageTimeout) {
			return true;
		}

		return false;
	}

	// Limpar mensagens antigas do cache
	cleanOldMessages() {
		const now = Date.now();
		for (const [hash, timestamp] of this.sentMessages.entries()) {
			if (now - timestamp > this.messageTimeout) {
				this.sentMessages.delete(hash);
			}
		}
	}

	async sendWhatsAppNotification(phoneNumber, message) {
		try {
			// Gerar hash para verificar duplicata
			const messageHash = this.generateMessageHash(phoneNumber, message);

			// Verificar se é mensagem duplicada
			if (this.isDuplicateMessage(messageHash)) {
				if (process.env.NODE_ENV !== 'production') {
					console.log(`🚫 Duplicate message detected for ${phoneNumber.slice(-4)} - skipping`);
				}
				return { success: true, skipped: true, reason: 'duplicate' };
			}

			// Limpar mensagens antigas periodicamente
			if (this.sentMessages.size > 100) {
				this.cleanOldMessages();
			}

			// Enviar a mensagem
			const result = await this.whatsAppClient.sendMessage(
				phoneNumber,
				message,
			);

			// Marcar mensagem como enviada
			this.sentMessages.set(messageHash, Date.now());

			// Log otimizado apenas em desenvolvimento
			if (process.env.NODE_ENV !== 'production') {
				console.log(`✅ Message sent to ${phoneNumber.slice(-4)}: ${message.substring(0, 30)}...`);
			}
			
			return result;
		} catch (error) {
			console.error('Error sending WhatsApp notification:', error);
			throw new Error('Failed to send WhatsApp notification');
		}
	}
}

export { INotificationService, WhatsNotificationService };
