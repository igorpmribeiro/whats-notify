import axios from 'axios';
import { Redis } from '@upstash/redis';

class CustomerApiClient {
	constructor(baseUrl, apiKey, storeId) {
		this.baseUrl = 'https://www.rufer.com.br/ws/v1/';
		this.apiKey = apiKey;
		this.storeId = storeId;
		this.tokenKey = `token:${this.storeId}`;

		// Initialize Redis client
		this.redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL,
			token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN,
		});
	}

	async getAccessToken(forceRefresh = false) {
		// Check Redis first
		if (!forceRefresh) {
			try {
				const cachedToken = await this.redis.get(this.tokenKey);
				if (cachedToken) {
					if (process.env.NODE_ENV !== 'production') {
						console.log(`🔑 Using cached token for store ${this.storeId}`);
					}
					return cachedToken;
				}
			} catch (error) {
				console.error('Error accessing Redis store:', error);
			}
		}

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

				try {
					// Store in Redis with 1 hour TTL (3600 seconds)
					await this.redis.setex(this.tokenKey, 3600, token);
				} catch (error) {
					console.error('Error saving token to Redis store:', error);
				}
				if (process.env.NODE_ENV !== 'production') {
					console.log(`🔑 Token obtained for store ${this.storeId}`);
				}
				return token;
			} else if (response.status === 403) {
				if (process.env.NODE_ENV !== 'production') {
					console.log('⚠️ Access Token already exists for this store');
				}
				const cachedToken = await this.redis.get(this.tokenKey);
				if (cachedToken) {
					if (process.env.NODE_ENV !== 'production') {
						console.log(`🔑 Using cached token for store ${this.storeId}`);
					}
					return cachedToken;
				}
				throw new Error(
					'Access Token already exists for this store and no cached token available',
				);
			}
		} catch (error) {
			console.error('Error fetching access token:', error);
			throw error;
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
			if (error.response && error.response.status === 403) {
				if (process.env.NODE_ENV !== 'production') {
					console.log('🔄 Token expired, refreshing...');
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

			console.error('Error fetching products:', error);
			throw error;
		}
	}
}

export { CustomerApiClient };
