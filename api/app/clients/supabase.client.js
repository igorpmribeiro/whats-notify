import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

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
}

export { SupabaseClient };
