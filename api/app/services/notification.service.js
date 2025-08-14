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
		this.messageTimeout = 300000; // 300 segundos
	}

	// Gerar hash da mensagem para evitar duplicatas
	generateMessageHash(phoneNumber, message) {
		const content = `${phoneNumber}:${message}`;
		// Criar hash mais robusto incluindo comprimento total e primeiras palavras
		const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
		const messageStart = normalizedMessage.slice(0, 100);
		return `${phoneNumber}_${content.length}_${messageStart.replace(/[^a-z0-9]/g, '')}`;
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
		let cleanedCount = 0;
		for (const [hash, timestamp] of this.sentMessages.entries()) {
			if (now - timestamp > this.messageTimeout) {
				this.sentMessages.delete(hash);
				cleanedCount++;
			}
		}
		if (cleanedCount > 0 && process.env.NODE_ENV !== 'production') {
			console.log(`🧹 Cleaned ${cleanedCount} old message(s) from cache`);
		}
	}

	async sendWhatsAppNotification(phoneNumber, message) {
		try {
			// Validar dados de entrada
			if (!phoneNumber || !message) {
				throw new Error('Phone number and message are required');
			}

			// Normalizar número de telefone
			const normalizedPhone = phoneNumber.replace(/\D/g, '');
			if (normalizedPhone.length < 10) {
				throw new Error('Invalid phone number format');
			}

			// Gerar hash para verificar duplicata
			const messageHash = this.generateMessageHash(normalizedPhone, message);

			// Verificar se é mensagem duplicada
			if (this.isDuplicateMessage(messageHash)) {
				if (process.env.NODE_ENV !== 'production') {
					console.log(
						`🚫 Duplicate message detected for ${normalizedPhone.slice(-4)} - skipping`,
					);
				}
				return { success: true, skipped: true, reason: 'duplicate' };
			}

			// Limpar mensagens antigas periodicamente
			if (this.sentMessages.size > 100) {
				this.cleanOldMessages();
			}

			// Enviar a mensagem
			const result = await this.whatsAppClient.sendMessage(
				normalizedPhone,
				message,
			);

			// Marcar mensagem como enviada
			this.sentMessages.set(messageHash, Date.now());

			// Log otimizado apenas em desenvolvimento
			if (process.env.NODE_ENV !== 'production') {
				console.log(
					`✅ Message sent to ${normalizedPhone.slice(-4)}: ${message.substring(0, 30)}...`,
				);
			}

			return { success: true, skipped: false, result };
		} catch (error) {
			console.error('Error sending WhatsApp notification:', error);
			throw new Error('Failed to send WhatsApp notification');
		}
	}

	// Método para obter estatísticas do cache (útil para monitoramento)
	getCacheStats() {
		const now = Date.now();
		let activeMessages = 0;
		let expiredMessages = 0;

		for (const [hash, timestamp] of this.sentMessages.entries()) {
			if (now - timestamp < this.messageTimeout) {
				activeMessages++;
			} else {
				expiredMessages++;
			}
		}

		return {
			totalCached: this.sentMessages.size,
			activeMessages,
			expiredMessages,
			timeoutMinutes: this.messageTimeout / 60000,
		};
	}
}

export { INotificationService, WhatsNotificationService };
