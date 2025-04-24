import { supabase } from '../../infrastructure/config/supabase';

export class ProductRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('product_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('product_id', id);

    if (error) throw error;
    return { success: true };
  }

  async getProductColors(productId) {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  async getProductSizes(productId) {
    const { data, error } = await supabase
      .from('product_sizes')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  async getProductInventory(colorIds, sizeIds) {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .in('color_id', colorIds)
      .in('size_id', sizeIds);

    if (error) throw error;
    return data;
  }

  async getProductImages(colorIds) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .in('color_id', colorIds);

    if (error) throw error;
    return data;
  }
} 