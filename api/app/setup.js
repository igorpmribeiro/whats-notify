import config from './config/index.js';
import { EvolutionApiClient } from './clients/evolution.client.js';
import { ChatProClient } from './clients/chatpro.client.js';
import { CustomerApiClient } from './clients/storeapi.client.js';
import { EvolutionWhatsAppProvider } from './providers/whatsapp.provider.js';
import { ChatProWhatsAppProvider } from './providers/whatsapp.provider.js';
import { WhatsNotificationService } from './services/notification.service.js';
import { OrderService } from './services/order.service.js';
import { ProductService } from './services/product.service.js';
import { WebhookController } from './webhook.controller.js';

class AppSetup {
	constructor() {
		this.evolutionApiClient = null;
		this.chatProClient = null;
		this.customerApiClient = null;
		this.chatProWhatsAppProvider = null;
		this.whatsAppProvider = null;
		this.notificationService = null;
		this.productService = null;
		this.orderService = null;
		this.webhookController = null;
	}

	async initialize() {
		try {
			// Verificar se as configurações necessárias estão presentes
			this.validateConfig();

			// Criar o cliente da Evolution API
			this.evolutionApiClient = new EvolutionApiClient(
				config.evolutionApi.baseUrl,
				config.evolutionApi.apiKey,
				config.evolutionApi.instanceName,
			);

			//Criar o cliente do ChatPro API
			this.chatProClient = new ChatProClient(
				config.chatPro.baseUrl,
				config.chatPro.instanceId,
				config.chatPro.apiKey,
			);

			// Criar o cliente da API do cliente
			this.customerApiClient = new CustomerApiClient(
				config.customerApi.baseUrl,
				config.customerApi.apiKey,
				config.customerApi.storeId,
			);

			// Criar o provider da Evolution WhatsApp
			// this.whatsAppProvider = new EvolutionWhatsAppProvider(this.evolutionApiClient);

			// Criar o provider do ChatPro WhatsApp
			this.chatProWhatsAppProvider = new ChatProWhatsAppProvider(
				this.chatProClient,
			);

			// Criar o serviço de notificação com Evolution API
			// this.notificationService = new WhatsNotificationService(this.whatsAppProvider);

			// Criar o serviço de notificação com ChatPro API
			this.notificationService = new WhatsNotificationService(
				this.chatProWhatsAppProvider,
			);

			// Criar o serviço de produtos
			this.productService = new ProductService(this.customerApiClient);

			// Criar o serviço de pedidos
			this.orderService = new OrderService(
				this.notificationService,
				this.productService,
			);

			// Criar o controller de webhook
			this.webhookController = new WebhookController(this.orderService);

			console.log('🚀 WhatsApp Notify services initialized successfully!');

			return {
				// evolutionApiClient: this.evolutionApiClient,
				chatProClient: this.chatProClient,
				customerApiClient: this.customerApiClient,
				whatsAppProvider: this.whatsAppProvider,
				chatProWhatsAppProvider: this.chatProWhatsAppProvider,
				notificationService: this.notificationService,
				productService: this.productService,
				orderService: this.orderService,
				webhookController: this.webhookController,
			};
		} catch (error) {
			console.error('❌ Failed to initialize services:', error.message);
			throw error;
		}
	}

	validateConfig() {
		const required = ['baseUrl', 'apiKey', 'instanceName'];
		const missing = required.filter((key) => !config.evolutionApi[key]);

		if (missing.length > 0) {
			throw new Error(
				`Missing Evolution API configuration: ${missing.join(', ')}`,
			);
		}
	}

	async checkEvolutionApiStatus() {
		try {
			const status = await this.evolutionApiClient.getInstanceStatus();
			if (process.env.NODE_ENV !== 'production') {
				console.log(
					`📱 Evolution API Status: ${status.instance?.connectionStatus || 'Unknown'}`,
				);
			}
		} catch (error) {
			if (process.env.NODE_ENV !== 'production') {
				console.warn('⚠️ Could not check Evolution API status:', error.message);
			}
		}
	}

	// Método para enviar mensagem de teste
	async sendTestMessage(
		phoneNumber,
		message = 'Olá! Esta é uma mensagem de teste do sistema de notificações.',
	) {
		try {
			const result = await this.notificationService.sendWhatsAppNotification(
				phoneNumber,
				message,
			);

			if (result.success && !result.skipped) {
				console.log('✅ Test message sent successfully!');
			} else if (result.skipped) {
				console.log('⚠️ Test message skipped (duplicate or recently sent)');
			}

			return result;
		} catch (error) {
			console.error('❌ Failed to send test message:', error.message);
			throw error;
		}
	}
}

export { AppSetup };
