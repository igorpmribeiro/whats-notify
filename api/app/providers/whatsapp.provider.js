// Integração com ChatPro API

class IWhatsAppProvider {
	sendMessage(to, message) {
		throw new Error('Method not implemented');
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
	ChatProWhatsAppProvider,
};
