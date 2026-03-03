import express from 'express';
import config from './app/config/index.js';
import { AppSetup } from './app/setup.js';
import { createWebhookRouter } from './app/webhook.router.js';
import { createChatProRouter } from './app/chatpro.router.js';
import { createProductWebhookRouter } from './app/product-webhook.router.js';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar serviços
const appSetup = new AppSetup();

async function startServer() {
	try {
		// Inicializar todos os serviços
		const services = await appSetup.initialize();

		// Configurar rotas
		const webhookRouter = createWebhookRouter(services.webhookController);
		const chatProRouter = createChatProRouter(services.chatProClient);
		const productWebhookRouter = createProductWebhookRouter(
			services.productWebhookController,
		);
		app.use('/webhook', webhookRouter);
		app.use('/chatpro', chatProRouter);
		app.use('/product-webhook', productWebhookRouter);

		// Rota raiz
		app.get('/', (req, res) => {
			res.json({
				message: 'WhatsApp Notify API is running!',
				version: '1.0.0',
				endpoints: {
					webhook: '/webhook/order-update',
					health: '/webhook/health',
					productWebhook: '/product-webhook/product-changed',
					productWebhookHealth: '/product-webhook/health',
					status: '/chatpro/status',
					qrcode: '/chatpro/qrcode',
					qrcodeDisplay: '/chatpro/qrcode/display',
					test: '/test-message',
				},
			});
		});

		// Rota para enviar mensagem de teste
		app.post('/test-message', async (req, res) => {
			try {
				const { phoneNumber, message } = req.body;

				if (!phoneNumber) {
					return res.status(400).json({ error: 'phoneNumber is required' });
				}

				const result = await appSetup.sendTestMessage(phoneNumber, message);

				const response = {
					success: true,
					message: 'Test message processed',
					phoneNumber,
					sent: !result?.skipped,
				};

				if (result?.skipped) {
					response.skippedReason = result.reason;
				}

				res.json(response);
			} catch (error) {
				res.status(500).json({
					error: 'Failed to send test message',
					details: error.message,
				});
			}
		});

		// Em desenvolvimento local, iniciamos o servidor
		app.listen(PORT, () => {
			console.log(`🚀 Server is running on http://localhost:${PORT}`);
			console.log('📱 WhatsApp notifications ready!');
			console.log(
				`📋 Webhook endpoint: http://localhost:${PORT}/webhook/order-update`,
			);
			console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-message`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error.message);
		process.exit(1);
	}
}

startServer();

// Export para Vercel (serverless functions)
export default app;
