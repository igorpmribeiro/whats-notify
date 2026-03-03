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
	supabase: {
		url:
			process.env.NEXT_PUBLIC_SUPABASE_URL ||
			'https://kdfqrbqerrawbvzmuxgf.supabase.co',
		anonKey:
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZnFyYnFlcnJhd2J2em11eGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTA5MTIsImV4cCI6MjA3NDc2NjkxMn0.AZx52hImgm7pR-4JAFUh-ZrpHsSIpH1UV8WYi7fMkYI',
	},
};

export default config;
