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
}

export { ProductService };
