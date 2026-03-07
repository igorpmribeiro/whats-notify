import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

const PRODUCT_BROADCASTS_TABLE = 'product_broadcasts';

class SupabaseClient {
	constructor() {
		this.client = createClient(config.supabase.url, config.supabase.anonKey);
	}

	/**
	 * Busca todos os clientes da tabela rufer_clients
	 * @returns {Promise<Array<{customer_name: string, customer_phone: string}>>}
	 */
	async getRuferClients() {
		const { data, error } = await this.client
			.from('rufer_clients')
			.select('customer_name, customer_phone');

		if (error) {
			console.error('❌ Erro ao buscar clientes no Supabase:', error.message);
			throw new Error(`Failed to fetch rufer_clients: ${error.message}`);
		}

		return data || [];
	}

	async tryStartProductBroadcast(product) {
		const payload = {
			product_id: String(product.productId),
			product_name: product.name,
			product_url: product.url,
			date_added: product.dateAdded,
			last_modified: product.lastModified,
			status: 'processing',
			sent: 0,
			failed: 0,
			total: 0,
			skipped_reason: null,
			last_error: null,
			sent_at: null,
		};

		const { error } = await this.client
			.from(PRODUCT_BROADCASTS_TABLE)
			.insert(payload);

		if (!error) {
			return { acquired: true, reason: 'created' };
		}

		if (error.code !== '23505') {
			console.error(
				'❌ Erro ao reservar broadcast de produto no Supabase:',
				error.message,
			);
			throw new Error(`Failed to reserve product broadcast: ${error.message}`);
		}

		const { data: retriedRow, error: retryError } = await this.client
			.from(PRODUCT_BROADCASTS_TABLE)
			.update(payload)
			.eq('product_id', String(product.productId))
			.eq('status', 'failed')
			.select('product_id')
			.maybeSingle();

		if (retryError) {
			console.error(
				'❌ Erro ao retentar broadcast de produto no Supabase:',
				retryError.message,
			);
			throw new Error(
				`Failed to retry product broadcast: ${retryError.message}`,
			);
		}

		if (retriedRow) {
			return { acquired: true, reason: 'retry_failed' };
		}

		const { data: existingRow, error: existingError } = await this.client
			.from(PRODUCT_BROADCASTS_TABLE)
			.select('status, sent_at, skipped_reason')
			.eq('product_id', String(product.productId))
			.maybeSingle();

		if (existingError) {
			console.error(
				'❌ Erro ao consultar broadcast existente no Supabase:',
				existingError.message,
			);
			throw new Error(
				`Failed to inspect existing product broadcast: ${existingError.message}`,
			);
		}

		return {
			acquired: false,
			reason: existingRow?.status || 'already_processed',
			existing: existingRow,
		};
	}

	async finishProductBroadcast(productId, result) {
		const payload = {
			status: result.status,
			sent: result.sent ?? 0,
			failed: result.failed ?? 0,
			total: result.total ?? 0,
			skipped_reason: result.skippedReason ?? null,
			last_error: result.lastError ?? null,
			sent_at: result.status === 'sent' ? new Date().toISOString() : null,
		};

		const { error } = await this.client
			.from(PRODUCT_BROADCASTS_TABLE)
			.update(payload)
			.eq('product_id', String(productId));

		if (error) {
			console.error(
				'❌ Erro ao finalizar broadcast de produto no Supabase:',
				error.message,
			);
			throw new Error(`Failed to finish product broadcast: ${error.message}`);
		}
	}
}

export { SupabaseClient };
