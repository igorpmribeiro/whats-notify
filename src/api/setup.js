import config from './config/index.js';
import { EvolutionApiClient } from './clients/evolution.client.js';
import { ChatProClient } from './clients/chatpro.client.js';
import { EvolutionWhatsAppProvider } from './providers/whatsapp.provider.js';
import { ChatProWhatsAppProvider } from './providers/whatsapp.provider.js';
import { WhatsNotificationService } from './services/notification.service.js';
import { OrderService } from './services/order.service.js';
import { WebhookController } from './webhook.controller.js';

class AppSetup {
	constructor() {
		this.evolutionApiClient = null;
		this.chatProClient = null;
    this.chatProWhatsAppProvider = null;
		this.whatsAppProvider = null;
		this.notificationService = null;
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
				config.evolutionApi.instanceName
			);

      //Criar o cliente do ChatPro API
      this.chatProClient = new ChatProClient(
        config.chatPro.baseUrl,
        config.chatPro.instanceId,
        config.chatPro.apiKey
      );

			// Criar o provider da Evolution WhatsApp
			// this.whatsAppProvider = new EvolutionWhatsAppProvider(this.evolutionApiClient);

			// Criar o provider do ChatPro WhatsApp
			this.chatProWhatsAppProvider = new ChatProWhatsAppProvider(this.chatProClient);

			// Criar o serviço de notificação com Evolution API
			// this.notificationService = new WhatsNotificationService(this.whatsAppProvider);

      // Criar o serviço de notificação com ChatPro API
      this.notificationService = new WhatsNotificationService(this.chatProWhatsAppProvider);

			// Criar o serviço de pedidos
			this.orderService = new OrderService(this.notificationService);

			// Criar o controller de webhook
			this.webhookController = new WebhookController(this.orderService);

			console.log('🚀 WhatsApp Notify services initialized successfully!');
			
			// Verificar status da instância (opcional)
			// await this.checkEvolutionApiStatus();

			return {
				// evolutionApiClient: this.evolutionApiClient,
        chatProClient: this.chatProClient,
				whatsAppProvider: this.whatsAppProvider,
        chatProWhatsAppProvider: this.chatProWhatsAppProvider,
				notificationService: this.notificationService,
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
		const missing = required.filter(key => !config.evolutionApi[key]);
		
		if (missing.length > 0) {
			throw new Error(`Missing Evolution API configuration: ${missing.join(', ')}`);
		}
	}

	async checkEvolutionApiStatus() {
		try {
			const status = await this.evolutionApiClient.getInstanceStatus();
			console.log(`📱 Evolution API Instance Status: ${status.instance?.connectionStatus || 'Unknown'}`);
		} catch (error) {
			console.warn('⚠️  Could not check Evolution API status:', error.message);
		}
	}

	// Método para enviar mensagem de teste
	async sendTestMessage(phoneNumber, message = 'Olá! Esta é uma mensagem de teste do sistema de notificações.') {
		try {
			await this.notificationService.sendWhatsAppNotification(phoneNumber, message);
			console.log('✅ Test message sent successfully!');
		} catch (error) {
			console.error('❌ Failed to send test message:', error.message);
			throw error;
		}
	}
}

export { AppSetup };
