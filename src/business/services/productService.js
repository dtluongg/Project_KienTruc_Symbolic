import { ProductModel } from '../../data/models/ProductModel';
import { ProductColorModel } from '../../data/models/ProductColorModel';
import { ProductSizeModel } from '../../data/models/ProductSizeModel';
import { ProductInventoryModel } from '../../data/models/ProductInventoryModel';
import { ProductImageModel } from '../../data/models/ProductImageModel';
import { validateProduct } from '../validators/productValidator';

export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllProducts() {
    try {
      const products = await this.repository.getAll();
      return products.map(product => new ProductModel(product));
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
      return new ProductModel(product);
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
      return new ProductModel(product);
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin sản phẩm: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      // Validate dữ liệu
      const { isValid, errors } = validateProduct(productData);
      if (!isValid) {
        throw new Error(JSON.stringify(errors));
      }

      // Tạo sản phẩm mới
      const newProduct = await this.repository.create(productData);
      return new ProductModel(newProduct);
    } catch (error) {
      throw new Error(`Lỗi khi tạo sản phẩm: ${error.message}`);
    }
  }

  async updateProduct(id, productData) {
    try {
      // Validate dữ liệu
      const { isValid, errors } = validateProduct(productData);
      if (!isValid) {
        throw new Error(JSON.stringify(errors));
      }

      // Cập nhật sản phẩm
      const updatedProduct = await this.repository.update(id, productData);
      return new ProductModel(updatedProduct);
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
        ...new ProductModel(product).toJSON(),
        colors: colors.map(color => new ProductColorModel(color).toJSON()),
        sizes: sizes.map(size => new ProductSizeModel(size).toJSON()),
        inventory: inventory.map(inv => new ProductInventoryModel(inv).toJSON()),
        images: images.map(img => new ProductImageModel(img).toJSON())
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết sản phẩm: ${error.message}`);
    }
  }
} 