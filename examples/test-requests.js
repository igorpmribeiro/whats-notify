// Exemplos de como usar a API

// Exemplo 1: Enviar mensagem de teste
const testMessage = {
	method: 'POST',
	url: 'http://localhost:3000/test-message',
	headers: {
		'Content-Type': 'application/json'
	},
	body: {
		phoneNumber: '5511999999999', // Substitua pelo seu número
		message: 'Olá! Esta é uma mensagem de teste do sistema.'
	}
};

// Exemplo 2: Webhook de atualização de pedido
const orderUpdate = {
	method: 'POST',
	url: 'http://localhost:3000/webhook/order-update',
	headers: {
		'Content-Type': 'application/json'
	},
	body: {
		orderId: 'PED-001',
		status: 'confirmed',
		customer: {
			phone: '5511999999999',
			name: 'João Silva'
		}
	}
};

// Exemplo 3: Health check
const healthCheck = {
	method: 'GET',
	url: 'http://localhost:3000/webhook/health'
};

// Como usar com fetch (Node.js):
/*
const fetch = require('node-fetch');

async function testAPI() {
	try {
		// Teste de saúde
		const healthResponse = await fetch('http://localhost:3000/webhook/health');
		console.log('Health:', await healthResponse.json());

		// Enviar mensagem de teste
		const testResponse = await fetch('http://localhost:3000/test-message', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				phoneNumber: '5511999999999',
				message: 'Teste do sistema!'
			})
		});
		console.log('Test Message:', await testResponse.json());

		// Simular webhook de pedido
		const orderResponse = await fetch('http://localhost:3000/webhook/order-update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				orderId: 'PED-001',
				status: 'ready',
				customer: {
					phone: '5511999999999',
					name: 'João Silva'
				}
			})
		});
		console.log('Order Update:', await orderResponse.json());

	} catch (error) {
		console.error('Error:', error);
	}
}

testAPI();
*/

export { testMessage, orderUpdate, healthCheck };
