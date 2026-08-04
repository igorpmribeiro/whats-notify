class ProductService {
	constructor(customerApiClient) {
		this.customerApiClient = customerApiClient;
	}

	async getProductNameById(productId) {
		try {
			const product = await this.customerApiClient.getProductById(productId);
			return product?.name || product?.product?.name || `Produto #${productId}`;
		} catch (error) {
			console.error(
				`Error fetching product name for ID ${productId}:`,
				error.message,
			);
			return `Produto #${productId}`;
		}
	}

	async getProductName(orderId) {
		try {
			const products = await this.customerApiClient.getProducts(orderId);
			return products.map((product) => product.name);
		} catch (error) {
			console.error('Error fetching product names:', error);
			throw new Error('Failed to fetch product names');
		}
	}

	// Retorna nomes dos produtos e o valor total do pedido em uma única chamada
	async getOrderDetails(orderId) {
		try {
			const data = await this.customerApiClient.getOrder(orderId);
			const products = data?.order?.products || [];

			// O total do pedido (já com frete e descontos) vem em order.totals
			const orderTotal = data?.order?.totals?.find(
				(total) => total.code === 'ot_total',
			);
			const totalValue = orderTotal?.value ?? data?.totalValue ?? null;

			return {
				productNames: products.map((product) => product.name),
				totalValue: typeof totalValue === 'number' ? totalValue : null,
			};
		} catch (error) {
			console.error('Error fetching order details:', error);
			throw new Error('Failed to fetch order details');
		}
	}
}

export { ProductService };
