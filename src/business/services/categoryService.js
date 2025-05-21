export class CategoryService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllCategories() {
    try {
      const categories = await this.repository.getAll();
      return categories;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách danh mục: ${error.message}`);
    }
  }

  async getAllCategoriesWithProductCount() {
    try {
      const categories = await this.repository.getAllCategoriesWithProductCount();
      return categories.map(category => ({
        ...category,
        product_count: category.product_count
      }));
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách danh mục với số lượng sản phẩm: ${error.message}`);
    }
  }

  async getCategoryById(id) {
    try {
      const category = await this.repository.getById(id);
      if (!category) {
        throw new Error('Không tìm thấy danh mục');
      }
      return category;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin danh mục: ${error.message}`);
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const category = await this.repository.getBySlug(slug);
      if (!category) {
        throw new Error('Không tìm thấy danh mục');
      }
      return category;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin danh mục: ${error.message}`);
    }
  }

  async createCategory(categoryData) {
    try {
      const newCategory = await this.repository.create(categoryData);
      return newCategory;
    } catch (error) {
      throw new Error(`Lỗi khi tạo danh mục: ${error.message}`);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const updatedCategory = await this.repository.update(id, categoryData);
      return updatedCategory;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật danh mục: ${error.message}`);
    }
  }

  async deleteCategory(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa danh mục: ${error.message}`);
    }
  }

  async getCategoryWithProducts(id) {
    try {
      const category = await this.repository.getById(id);
      if (!category) {
        throw new Error('Không tìm thấy danh mục');
      }
      const products = await this.repository.getCategoryProducts(id);
      return {
        ...category,
        products
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh mục và sản phẩm: ${error.message}`);
    }
  }
} 