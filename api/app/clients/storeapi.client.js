import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

class CustomerApiClient {
	constructor(baseUrl, apiKey, storeId) {
		this.baseUrl = 'https://www.rufer.com.br/ws/v1/';
		this.apiKey = apiKey;
		this.storeId = storeId;

		// Initialize Supabase client
		this.supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		);
	}

	async getAccessToken(forceRefresh = false) {
		// 1. Tentar usar token armazenada no Supabase (se não for forceRefresh)
		if (!forceRefresh) {
			try {
				const { data, error } = await this.supabase
					.from('api_tokens')
					.select('access_token')
					.eq('store_id', this.storeId)
					.single();

				if (!error && data?.access_token) {
					if (process.env.NODE_ENV !== 'production') {
						console.log(`🔑 Using cached token for store ${this.storeId}`);
					}
					return data.access_token;
				}
			} catch (error) {
				console.error('Error accessing Supabase store:', error);
			}
		}

		// 2. Se não tiver token armazenada ou forceRefresh, autenticar na API
		return await this.authenticateAndStoreToken();
	}

	async authenticateAndStoreToken() {
		try {
			const credentials = Buffer.from(
				`${this.storeId}:${this.apiKey}`,
			).toString('base64');
			const options = {
				method: 'POST',
				url: `${this.baseUrl}oauth`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Basic ${credentials}`,
				},
			};

			const response = await axios(options);

			if (response.status === 200) {
				const token = response.data.token;
				await this.updateTokenInSupabase(token);

				if (process.env.NODE_ENV !== 'production') {
					console.log(`🔑 Token obtained for store ${this.storeId}`);
				}
				return token;
			}
		} catch (error) {
			// Verificar se o erro 403 indica que a token já existe no servidor da API
			if (error.response?.status === 403) {
				const errorMessage = error.response?.data?.message || '';

				if (errorMessage === 'Access token already been created to this authentication.') {
					// Token já existe no servidor, buscar do Supabase
					if (process.env.NODE_ENV !== 'production') {
						console.log('⚠️ Token already exists on API server, fetching from Supabase');
					}

					const { data, error: supabaseError } = await this.supabase
						.from('api_tokens')
						.select('access_token')
						.eq('store_id', this.storeId)
						.single();

					if (!supabaseError && data?.access_token) {
						if (process.env.NODE_ENV !== 'production') {
							console.log(`🔑 Using cached token for store ${this.storeId}`);
						}
						return data.access_token;
					}

					throw new Error('Token already exists on API but not found in Supabase. Please contact support.');
				}
			}

			console.error('Error authenticating:', error.response?.data || error.message);
			throw error;
		}
	}

	async updateTokenInSupabase(token) {
		try {
			// Usar UPSERT para garantir que não há duplicatas
			// onConflict: 'store_id' significa que se já existir um registro com o mesmo store_id,
			// ele será atualizado ao invés de criar um novo
			const { error } = await this.supabase
				.from('api_tokens')
				.upsert({
					store_id: this.storeId,
					access_token: token
				}, {
					onConflict: 'store_id',
					ignoreDuplicates: false // Atualiza se existir
				});

			if (error) {
				console.error('Error upserting token in Supabase:', error);
			} else if (process.env.NODE_ENV !== 'production') {
				console.log(`✅ Token saved for store ${this.storeId}`);
			}
		} catch (error) {
			console.error('Error saving token to Supabase store:', error);
		}
	}

	async getProducts(orderId) {
		try {
			const token = await this.getAccessToken();
			const options = {
				method: 'GET',
				url: `${this.baseUrl}order/${orderId}`,
				headers: {
					'access-token': token,
					'Content-Type': 'application/json',
				},
			};

			const response = await axios(options);
			return response.data.order.products;
		} catch (error) {
			// Verificar se o erro é 403 (token inválida)
			if (error.response?.status === 403) {
				const errorMessage = error.response?.data?.message || '';

				// Token inválida ou expirada - tentar refresh
				if (errorMessage === 'Access token is missing or invalid.') {
					if (process.env.NODE_ENV !== 'production') {
						console.log('🔄 Token invalid or expired, refreshing...');
					}

					try {
						const newToken = await this.getAccessToken(true);
						const retryOptions = {
							method: 'GET',
							url: `${this.baseUrl}order/${orderId}`,
							headers: {
								'access-token': newToken,
								'Content-Type': 'application/json',
							},
						};

						const retryResponse = await axios(retryOptions);
						return retryResponse.data.order.products;
					} catch (retryError) {
						console.error('Error after token refresh:', retryError);
						throw retryError;
					}
				}
			}

			console.error('Error fetching products:', error);
			throw error;
		}
	}
}

export { CustomerApiClient };
