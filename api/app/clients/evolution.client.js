import axios from 'axios';

class EvolutionApiClient {
	constructor(baseUrl, apiKey, instanceName) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.instanceName = instanceName;
		
		this.httpClient = axios.create({
			baseURL: baseUrl,
			headers: {
				'Content-Type': 'application/json',
				'apikey': apiKey,
			},
			timeout: 30000, // 30 segundos
		});
	}

	async sendWhatsAppMessage(to, message) {
		try {
			// Remove caracteres não numéricos do número de telefone
			const phoneNumber = to.replace(/\D/g, '');
			
			const payload = {
				number: phoneNumber,
				text: message,
			};

			const response = await this.httpClient.post(
				`/message/sendText/${this.instanceName}`,
				payload
			);

			return {
				success: true,
				messageId: response.data.key?.id,
				data: response.data,
			};
		} catch (error) {
			console.error('Evolution API Error:', error.response?.data || error.message);
			throw new Error(`Failed to send message via Evolution API: ${error.response?.data?.message || error.message}`);
		}
	}

	async sendWhatsAppMedia(to, mediaUrl, caption = '') {
		try {
			const phoneNumber = to.replace(/\D/g, '');
			
			const payload = {
				number: phoneNumber,
				media: mediaUrl,
				caption: caption,
			};

			const response = await this.httpClient.post(
				`/message/sendMedia/${this.instanceName}`,
				payload
			);

			return {
				success: true,
				messageId: response.data.key?.id,
				data: response.data,
			};
		} catch (error) {
			console.error('Evolution API Media Error:', error.response?.data || error.message);
			throw new Error(`Failed to send media via Evolution API: ${error.response?.data?.message || error.message}`);
		}
	}

	async getInstanceStatus() {
		try {
			const response = await this.httpClient.get(`/instance/connectionState/${this.instanceName}`);
			return response.data;
		} catch (error) {
			console.error('Evolution API Status Error:', error.response?.data || error.message);
			throw new Error(`Failed to get instance status: ${error.response?.data?.message || error.message}`);
		}
	}

	async generateQRCode() {
		try {
			const response = await this.httpClient.get(`/instance/connect/${this.instanceName}`);
			return response.data;
		} catch (error) {
			console.error('Evolution API QR Error:', error.response?.data || error.message);
			throw new Error(`Failed to generate QR code: ${error.response?.data?.message || error.message}`);
		}
	}
}

export { EvolutionApiClient };
