import { supabase } from '../../infrastructure/config/supabase';

export class PaymentRepository {
  async create(paymentData) {
    try {
      const dbPaymentData = {
        order_id: paymentData.order_id,
        method_id: paymentData.payment_method_id,
        amount: paymentData.amount,
        status: paymentData.status,
        payment_date: paymentData.transaction_time,
        transaction_id: paymentData.transaction_id,
        notes: paymentData.notes
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([dbPaymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi tạo payment:', error);
      throw error;
    }
  }

  async update(paymentId, updateData) {
    try {
      const dbUpdateData = {
        status: updateData.status,
        transaction_id: updateData.transaction_id,
        payment_date: updateData.updated_at,
        notes: updateData.notes
      };

      const { data, error } = await supabase
        .from('payments')
        .update(dbUpdateData)
        .eq('payment_id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi cập nhật payment:', error);
      throw error;
    }
  }

  async getByOrderId(orderId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          payment_methods:method_id (*)
        `)
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy payment theo order_id:', error);
      throw error;
    }
  }
} 