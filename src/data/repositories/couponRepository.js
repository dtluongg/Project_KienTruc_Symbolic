import { supabase } from '../../infrastructure/config/supabase';

export class CouponRepository {
  constructor() {
    this.table = 'coupons';
  }

  async getCouponByCode(code) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_to', new Date().toISOString())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy mã giảm giá:', error);
      return null;
    }
  }

  async updateCouponUsage(couponId) {
    try {
      const { data: coupon, error: fetchError } = await supabase
        .from(this.table)
        .select('usage_count')
        .eq('coupon_id', couponId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from(this.table)
        .update({ 
          usage_count: coupon.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('coupon_id', couponId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật số lần sử dụng mã giảm giá:', error);
      throw error;
    }
  }

  async getAllCoupons() {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả mã giảm giá:', error);
      throw error;
    }
  }

  async getActiveCoupons() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', now)
        .gte('valid_to', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy mã giảm giá đang hoạt động:', error);
      throw error;
    }
  }

  async createCoupon(couponData) {
    try {
      const now = new Date().toISOString();
      const newCoupon = {
        ...couponData,
        usage_count: 0,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from(this.table)
        .insert(newCoupon)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Lỗi khi tạo mã giảm giá:', error);
      throw error;
    }
  }
} 