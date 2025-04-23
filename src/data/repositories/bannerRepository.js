import { supabase } from '../../infrastructure/config/supabase';

export class BannerRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('banner_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(bannerData) {
    const { data, error } = await supabase
      .from('banners')
      .insert([bannerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, bannerData) {
    const { data, error } = await supabase
      .from('banners')
      .update(bannerData)
      .eq('banner_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: false })
      .eq('banner_id', id);

    if (error) throw error;
    return { success: true };
  }
} 