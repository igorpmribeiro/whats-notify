import dotenv from 'dotenv';

dotenv.config();

const config = {
	server: {
		port: process.env.PORT || 3000,
	},
	evolutionApi: {
		baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
		apiKey: process.env.EVOLUTION_API_KEY,
		instanceName: process.env.EVOLUTION_INSTANCE_NAME,
	},
  chatPro: {
    baseUrl: process.env.CHATPRO_API_URL || 'https://v5.chatpro.com.br/',
    instanceId: process.env.CHATPRO_INSTANCEID,
    apiKey: process.env.CHATPRO_TOKEN,
  },
};

export default config;