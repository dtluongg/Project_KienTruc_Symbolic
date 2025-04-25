/**
 * Lớp đại diện cho model Coupon
 */
export class CouponModel {
  /**
   * Khởi tạo đối tượng Coupon
   * @param {Object} data - Dữ liệu coupon từ database
   */
  constructor(data = {}) {
    this.coupon_id = data.coupon_id || null;
    this.code = data.code || '';
    this.discount_type = data.discount_type || 'fixed'; // 'fixed' hoặc 'percentage'
    this.discount_value = data.discount_value || 0;
    this.min_order_value = data.min_order_value || 0;
    this.max_discount = data.max_discount || null;
    this.valid_from = data.valid_from ? new Date(data.valid_from) : new Date();
    this.valid_to = data.valid_to ? new Date(data.valid_to) : new Date();
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.usage_limit = data.usage_limit || null;
    this.usage_count = data.usage_count || 0;
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
    this.updated_at = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  /**
   * Chuyển đổi đối tượng sang dạng dữ liệu phù hợp để lưu vào database
   * @returns {Object} - Dữ liệu để lưu vào database
   */
  toDatabase() {
    return {
      code: this.code,
      discount_type: this.discount_type,
      discount_value: this.discount_value,
      min_order_value: this.min_order_value,
      max_discount: this.max_discount,
      valid_from: this.valid_from.toISOString(),
      valid_to: this.valid_to.toISOString(),
      is_active: this.is_active,
      usage_limit: this.usage_limit,
      usage_count: this.usage_count,
      created_at: this.created_at.toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Kiểm tra mã giảm giá còn hiệu lực không
   * @returns {boolean} - True nếu coupon còn hiệu lực
   */
  isValid() {
    const now = new Date();
    
    // Kiểm tra thời gian hiệu lực
    if (now < this.valid_from || now > this.valid_to) {
      return false;
    }
    
    // Kiểm tra trạng thái hoạt động
    if (!this.is_active) {
      return false;
    }
    
    // Kiểm tra giới hạn sử dụng
    if (this.usage_limit !== null && this.usage_count >= this.usage_limit) {
      return false;
    }
    
    return true;
  }

  /**
   * Tính toán số tiền giảm giá dựa trên tổng đơn hàng
   * @param {number} orderAmount - Tổng giá trị đơn hàng
   * @returns {number} - Số tiền được giảm giá
   */
  calculateDiscount(orderAmount) {
    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount < this.min_order_value) {
      return 0;
    }
    
    let discountAmount = 0;
    
    if (this.discount_type === 'percentage') {
      // Tính giảm giá theo phần trăm
      discountAmount = (orderAmount * this.discount_value) / 100;
      
      // Giới hạn số tiền giảm tối đa
      if (this.max_discount !== null) {
        discountAmount = Math.min(discountAmount, this.max_discount);
      }
    } else {
      // Giảm giá cố định
      discountAmount = Math.min(this.discount_value, orderAmount);
    }
    
    return discountAmount;
  }
}
