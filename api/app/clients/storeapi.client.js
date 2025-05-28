import axios from 'axios';
import fs from 'fs';
import path from 'path';

class CustomerApiClient {
	constructor(baseUrl, apiKey, storeId) {
		this.baseUrl = 'https://www.create4.us/ws/v1/';
		this.apiKey = apiKey;
		this.storeId = storeId;
		this.cachedToken = null;
		this.tokenFilePath = path.join(process.cwd(), 'api', 'app', 'clients', `.token-${this.storeId}.json`);
		
		// Carrega token do arquivo ao inicializar
		this.loadTokenFromFile();
	}

	// Carrega token do arquivo
	loadTokenFromFile() {
		try {
			if (fs.existsSync(this.tokenFilePath)) {
				const tokenData = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
				this.cachedToken = tokenData.token;
				console.log(`Token loaded from file for store ${this.storeId}`);
			}
		} catch (error) {
			console.error('Error loading token from file:', error);
		}
	}

	// Salva token no arquivo
	saveTokenToFile(token) {
		try {
			const tokenData = {
				token: token,
				storeId: this.storeId,
				timestamp: new Date().toISOString()
			};
			fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokenData, null, 2));
			console.log(`Token saved to file for store ${this.storeId}`);
		} catch (error) {
			console.error('Error saving token to file:', error);
		}
	}

	async getAccessToken(forceRefresh = false) {
		// Se já temos um token em cache e não estamos forçando refresh, retorna o cached
		// Token dura 15 minutos e se renova automaticamente a cada request
		if (this.cachedToken && !forceRefresh) {
			return this.cachedToken;
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
				this.cachedToken = response.data.token;
				// Salva o token no arquivo
				this.saveTokenToFile(this.cachedToken);
				return this.cachedToken;
			} else if (response.status === 403) {
				// Token já existe para esta loja - vamos tentar usar um token existente se disponível
				console.log('Access Token already exists for this store');
				// Se já temos um token em cache, vamos tentar usá-lo
				if (this.cachedToken) {
					console.log('Using existing cached token');
					return this.cachedToken;
				}
				// Se não temos token em cache, relança o erro
				throw new Error('Access Token already exists for this store and no cached token available');
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
			// Se receber erro 403 (token inválido/expirado), tenta renovar o token
			if (error.response && error.response.status === 403) {
				console.log('Token expired or invalid, refreshing...');
				try {
					const newToken = await this.getAccessToken(true); // Force refresh
					// Salva o novo token no arquivo
					this.saveTokenToFile(newToken);
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
