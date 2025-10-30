import dotenv from 'dotenv';

dotenv.config();

const config = {
	server: {
		port: process.env.PORT || 3000,
	},
	chatPro: {
		baseUrl: process.env.CHATPRO_API_URL || 'https://v5.chatpro.com.br/',
		instanceId: process.env.CHATPRO_INSTANCEID,
		apiKey: process.env.CHATPRO_TOKEN,
	},
	customerApi: {
		baseUrl:
			process.env.CUSTOMER_API_BASE_URL || 'https://www.rufer.com.br/ws/v1/',
		apiKey: process.env.CUSTOMER_API_KEY,
		storeId: process.env.CUSTOMER_STORE_ID,
	},
};

export default config;
