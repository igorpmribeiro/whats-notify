class ProductService {
	constructor(customerApiClient) {
		this.customerApiClient = customerApiClient;
	}

	async getProductNameById(productId) {
		try {
			const response = await this.customerApiClient.getProductById(productId);
			const product = response?.result?.[0];

			if (product?.date_added) {
				const today = new Date().toISOString().slice(0, 10);
				const dateAdded = product.date_added.slice(0, 10);
				const lastModified = product.last_modified;

				if (dateAdded !== today && lastModified == null) {
					console.log(
						`Product #${productId} was added on ${dateAdded}, not today (${today}). Skipping notification.`,
					);
					return null;
				}
			}

			return {
				name: product?.name || null,
				url: product?.url || null,
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
