class ProductService {
	constructor(customerApiClient) {
		this.customerApiClient = customerApiClient;
	}

	async getProductNameById(productId) {
		try {
			const response = await this.customerApiClient.getProductById(productId);
			const product = response?.result?.[0];

			if (!product || !product.date_added) {
				console.log(
					`Product #${productId} has no date_added. Skipping notification.`,
				);
				return null;
			}

			const now = new Date();
			const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
			const dateAdded = product.date_added.slice(0, 10);

			const isToday = dateAdded === today;
			const isNewProduct = product.last_modified === null;

			if (!isToday && !isNewProduct) {
				console.log(
					`Product #${productId} skipped — date_added: ${dateAdded}, today: ${today}, last_modified: ${product.last_modified ?? 'null'}.`,
				);
				return null;
			}

			return {
				name: product.name || null,
				url: product.url || null,
			};
		} catch (error) {
			console.error(
				`Error fetching product name for ID ${productId}:`,
				error.message,
			);
			return null;
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
