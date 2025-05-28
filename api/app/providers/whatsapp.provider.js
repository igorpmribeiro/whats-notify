// Integração com Evolution API

class IWhatsAppProvider {
	sendMessage(to, message) {
		throw new Error('Method not implemented');
	}
}

class EvolutionWhatsAppProvider extends IWhatsAppProvider {
	constructor(evolutionApiClient) {
		super();
		this.evolutionApiClient = evolutionApiClient;
	}

	async sendMessage(to, message) {
		try {
			const response = await this.evolutionApiClient.sendWhatsAppMessage(
				to,
				message,
			);
			// Log removido - já é feito no notification.service
			return response;
		} catch (error) {
			console.error('Error sending WhatsApp message:', error);
			throw new Error('Failed to send WhatsApp message');
		}
	}
}

class ChatProWhatsAppProvider extends IWhatsAppProvider {
	constructor(chatProClient) {
		super();
		this.chatProClient = chatProClient;
	}

	async sendMessage(to, message) {
		try {
			const response = await this.chatProClient.sendMessage(to, message);
			return response;
		} catch (error) {
			console.error('Error sending WhatsApp message:', error);
			throw new Error('Failed to send WhatsApp message');
		}
	}
}

export {
	IWhatsAppProvider,
	EvolutionWhatsAppProvider,
	ChatProWhatsAppProvider,
};
