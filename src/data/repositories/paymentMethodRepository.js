import { supabase } from '../../infrastructure/config/supabase';

export class PaymentMethodRepository {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy phương thức thanh toán:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('method_id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy phương thức thanh toán theo ID:', error);
      throw error;
    }
  }

  async create(methodData) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([methodData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi tạo phương thức thanh toán:', error);
      throw error;
    }
  }

  async update(id, methodData) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(methodData)
        .eq('method_id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi cập nhật phương thức thanh toán:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('method_id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi xóa phương thức thanh toán:', error);
      throw error;
    }
  }
} 