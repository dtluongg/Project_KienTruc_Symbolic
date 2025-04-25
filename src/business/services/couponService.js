import { CouponRepository } from '../../data/repositories/couponRepository';
import { CouponModel } from '../models/CouponModel';

export class CouponService {
  constructor() {
    this.couponRepository = new CouponRepository();
  }

  async validateCoupon(couponCode, orderAmount = 0) {
    try {
      if (!couponCode) {
        return {
          valid: false,
          message: 'Vui lòng nhập mã giảm giá'
        };
      }

      const couponData = await this.couponRepository.getCouponByCode(couponCode);
      
      if (!couponData) {
        return {
          valid: false,
          message: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
        };
      }

      // Chuyển đổi dữ liệu từ repository thành object CouponModel
      const coupon = new CouponModel(couponData);

      // Kiểm tra tính hợp lệ của coupon
      if (!coupon.isValid()) {
        return {
          valid: false,
          message: 'Mã giảm giá đã hết hạn hoặc không còn hiệu lực'
        };
      }

      // Kiểm tra giá trị tối thiểu của đơn hàng
      if (orderAmount < coupon.min_order_value) {
        return {
          valid: false,
          message: `Đơn hàng tối thiểu ${coupon.min_order_value.toLocaleString('vi-VN')}đ để sử dụng mã này`
        };
      }

      return {
        valid: true,
        coupon: couponData // Trả về dữ liệu gốc từ database
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra mã giảm giá:', error);
      return {
        valid: false,
        message: 'Đã xảy ra lỗi khi kiểm tra mã giảm giá'
      };
    }
  }

  async applyCoupon(couponCode, orderAmount) {
    const validation = await this.validateCoupon(couponCode, orderAmount);
    
    if (!validation.valid) {
      return validation;
    }

    const couponData = validation.coupon;
    const coupon = new CouponModel(couponData);
    const discountAmount = coupon.calculateDiscount(orderAmount);

    return {
      valid: true,
      coupon_id: coupon.coupon_id,
      discount_amount: discountAmount,
      message: 'Áp dụng mã giảm giá thành công'
    };
  }

  async getAllActiveCoupons() {
    const coupons = await this.couponRepository.getActiveCoupons();
    return coupons.map(couponData => new CouponModel(couponData));
  }

  async getAllCoupons() {
    const coupons = await this.couponRepository.getAllCoupons();
    return coupons.map(couponData => new CouponModel(couponData));
  }

  async createCoupon(couponData) {
    // Đảm bảo couponData có đầy đủ thông tin cần thiết
    const requiredFields = ['code', 'discount_type', 'discount_value', 'min_order_value', 'valid_from', 'valid_to'];
    for (const field of requiredFields) {
      if (!couponData[field]) {
        return {
          success: false,
          message: `Thiếu thông tin: ${field}`
        };
      }
    }

    try {
      // Tạo model và chuyển đổi dữ liệu
      const coupon = new CouponModel(couponData);
      const dbData = coupon.toDatabase();
      
      // Lưu vào database
      const createdCoupon = await this.couponRepository.createCoupon(dbData);
      
      return {
        success: true,
        message: 'Tạo mã giảm giá thành công',
        coupon: new CouponModel(createdCoupon)
      };
    } catch (error) {
      console.error('Lỗi khi tạo mã giảm giá:', error);
      return {
        success: false,
        message: error.message || 'Lỗi khi tạo mã giảm giá'
      };
    }
  }
}
