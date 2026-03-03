class ProductService {
	constructor(customerApiClient) {
		this.customerApiClient = customerApiClient;
	}

	async getProductNameById(productId) {
		try {
			const response = await this.customerApiClient.getProductById(productId);
			return {
				name: response?.result?.[0]?.name || null,
				url: response?.result?.[0]?.url || null,
			};
		} catch (error) {
			console.error(
				`Error fetching product name for ID ${productId}:`,
				error.message,
			);
			return {
				name: `Produto #${productId}`,
				url: null,
			};
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
}

export { ProductService };
