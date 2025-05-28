class ProductService { 
  constructor(customerApiClient) {
    this.customerApiClient = customerApiClient;
  }

  async getProductName(orderId) {
    try {
      const products = await this.customerApiClient.getProducts(orderId);;
      return products.map(product => product.name);
    } catch (error) {
      console.error('Error fetching product names:', error);
      throw new Error('Failed to fetch product names');
    }
  }
}

export { ProductService };