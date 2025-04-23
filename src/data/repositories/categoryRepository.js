import { supabase } from '../../infrastructure/config/supabase';

export class CategoryRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    return data;
  }

  async getAllWithProductCount() {
    // Lấy danh mục và đếm số sản phẩm trong mỗi danh mục
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        products:products(count)
      `);

    if (error) throw error;

    // Chuyển đổi dữ liệu để thêm số lượng sản phẩm vào mỗi danh mục
    return data.map(category => ({
      ...category,
      product_count: category.products[0]?.count || 0
    }));
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
} 