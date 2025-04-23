import { supabase } from '../../infrastructure/config/supabase';

export class CategoryRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('category_id', id);

    if (error) throw error;
    return { success: true };
  }

  async getCategoryProducts(categoryId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  async getProductCountByCategory(categoryId) {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  }

  async getAllCategoriesWithProductCount() {
    // Lấy tất cả các danh mục
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    // Lấy số lượng sản phẩm cho từng danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await this.getProductCountByCategory(category.category_id);
        return {
          ...category,
          product_count: count
        };
      })
    );

    return categoriesWithCount;
  }
} 