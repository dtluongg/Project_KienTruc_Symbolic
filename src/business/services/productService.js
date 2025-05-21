export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllProducts() {
    try {
      const products = await this.repository.getAll();
      return products;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách sản phẩm: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const product = await this.repository.getById(id);
      if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
      }
      return product;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin sản phẩm: ${error.message}`);
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await this.repository.getBySlug(slug);
      if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
      }
      return product;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin sản phẩm: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      // Bỏ validate
      const newProduct = await this.repository.create(productData);
      return newProduct;
    } catch (error) {
      throw new Error(`Lỗi khi tạo sản phẩm: ${error.message}`);
    }
  }

  async updateProduct(id, productData) {
    try {
      // Bỏ validate
      const updatedProduct = await this.repository.update(id, productData);
      return updatedProduct;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật sản phẩm: ${error.message}`);
    }
  }

  async deleteProduct(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa sản phẩm: ${error.message}`);
    }
  }

  async getProductDetails(idOrSlug) {
    try {
      let product;
      // Kiểm tra xem idOrSlug có phải là số không
      if (!isNaN(idOrSlug)) {
        product = await this.repository.getById(idOrSlug);
      } else {
        product = await this.repository.getBySlug(idOrSlug);
      }
      if (!product) {
        throw new Error('Không tìm thấy sản phẩm');
      }
      const colors = await this.repository.getProductColors(product.product_id);
      const sizes = await this.repository.getProductSizes(product.product_id);
      const colorIds = colors.map(c => c.color_id);
      const sizeIds = sizes.map(s => s.size_id);
      const inventory = await this.repository.getProductInventory(colorIds, sizeIds);
      const images = await this.repository.getProductImages(colorIds);
      return {
        ...product,
        colors,
        sizes,
        inventory,
        images
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết sản phẩm: ${error.message}`);
    }
  }
} 