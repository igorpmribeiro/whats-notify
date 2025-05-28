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
                    // Store in Redis with 15 minutes TTL (900 seconds)
                    await this.redis.setex(this.tokenKey, 900, token);
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

    // ...existing code for getProducts...
}

export { CustomerApiClient };