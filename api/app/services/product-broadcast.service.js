/**
 * ============================================================
 * TEMPLATE DA MENSAGEM DE NOVO PRODUTO
 *
 * Edite a variável abaixo para customizar a mensagem enviada.
 * Use {PRODUCT_NAME} como placeholder para o nome do produto.
 * Use {CUSTOMER_NAME} como placeholder para o nome do cliente.
 * ============================================================
 */
const MESSAGE_TEMPLATE = `🚀 Novidade na loja!

Olá {CUSTOMER_NAME}, temos uma novidade para você!

Acabamos de adicionar um novo produto: *{PRODUCT_NAME}*

Acesse {PRODUCT_URL} e confira! 🛒`;

/**
 * Delay entre envios de mensagem (em ms) para evitar bloqueio por spam.
 */
const DELAY_BETWEEN_MESSAGES_MS = 3000;

class ProductBroadcastService {
	constructor(supabaseClient, notificationService, productService) {
		this.supabaseClient = supabaseClient;
		this.notificationService = notificationService;
		this.productService = productService;
	}

	/**
	 * Monta a mensagem personalizada para o cliente.
	 */
	buildMessage(customerName, productName, productUrl) {
		return MESSAGE_TEMPLATE.replace(/{PRODUCT_NAME}/g, productName)
			.replace(/{CUSTOMER_NAME}/g, customerName)
			.replace(/{PRODUCT_URL}/g, productUrl);
	}

	/**
	 * Aguarda um tempo para espaçar os envios.
	 */
	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Gera a URL do produto no padrão da plataforma.
	 * Formato: https://www.rufer.com.br/nome-do-produto-pIdDoProduto
	 */
	buildProductUrl(productName, productId) {
		const slug = productName
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gv, '') // remove acentos
			.replace(/[^a-z0-9]+/g, '-') // substitui caracteres especiais por hífen
			.replace(/^-|-$/g, ''); // remove hífens do início/fim
		return `https://www.rufer.com.br/${slug}-p${productId}`;
	}

	/**
	 * Processa o webhook de produto alterado/criado.
	 * 1. Busca o nome do produto via ProductService
	 * 2. Busca todos os clientes da tabela rufer_clients no Supabase
	 * 3. Dispara a mensagem para cada cliente
	 */
	async broadcastNewProduct(productId) {
		console.log(`📦 Iniciando broadcast para produto ID: ${productId}`);

		// 1. Buscar nome do produto
		const productData = await this.productService.getProductNameById(productId);

		if (!productData) {
			console.log(
				`⏭️ Produto ID ${productId} não é de hoje. Broadcast cancelado.`,
			);
			return {
				success: true,
				sent: 0,
				failed: 0,
				total: 0,
				skippedReason: 'not_added_today',
			};
		}

		const productName = productData.name;
		const productUrl =
			productData.url || this.buildProductUrl(productName, productId);
		console.log(`📦 Produto: ${productName}, URL: ${productUrl}`);

		// 2. Buscar clientes do Supabase
		const clients = await this.supabaseClient.getRuferClients();

		if (!clients || clients.length === 0) {
			console.log('⚠️ Nenhum cliente encontrado na tabela rufer_clients');
			return { success: true, sent: 0, failed: 0, total: 0 };
		}

		console.log(
			`📋 ${clients.length} cliente(s) encontrado(s). Iniciando envio...`,
		);

		let sent = 0;
		let failed = 0;
		const results = [];

		// 3. Iterar e enviar para cada cliente
		for (const client of clients) {
			const { customer_name, customer_phone } = client;

			if (!customer_phone) {
				console.log(`⚠️ Cliente "${customer_name}" sem telefone, pulando...`);
				failed++;
				results.push({ customer_name, status: 'skipped', reason: 'no_phone' });
				continue;
			}

			try {
				const message = this.buildMessage(
					customer_name || 'Cliente',
					productName,
					productUrl,
				);
				const result = await this.notificationService.sendWhatsAppNotification(
					customer_phone,
					message,
				);

				if (result?.skipped) {
					console.log(
						`🚫 Mensagem para "${customer_name}" duplicada, pulando.`,
					);
					results.push({
						customer_name,
						status: 'skipped',
						reason: result.reason,
					});
				} else {
					console.log(
						`✅ Mensagem enviada para "${customer_name}" (${customer_phone})`,
					);
					sent++;
					results.push({ customer_name, status: 'sent' });
				}
			} catch (error) {
				console.error(
					`❌ Erro ao enviar para "${customer_name}":`,
					error.message,
				);
				failed++;
				results.push({ customer_name, status: 'error', reason: error.message });
			}

			// Delay entre mensagens para não ser bloqueado
			if (clients.indexOf(client) < clients.length - 1) {
				await this.sleep(DELAY_BETWEEN_MESSAGES_MS);
			}
		}

		console.log(
			`📊 Broadcast finalizado: ${sent} enviados, ${failed} falharam, ${clients.length} total`,
		);

		return {
			success: true,
			productId,
			productName,
			sent,
			failed,
			total: clients.length,
			results,
		};
	}
}

export { ProductBroadcastService, MESSAGE_TEMPLATE };
