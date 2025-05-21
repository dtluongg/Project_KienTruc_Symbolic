import { CouponRepository } from '../../data/repositories/couponRepository';

export class CouponService {
  constructor(repository) {
    this.repository = repository;
  }

  async validateCoupon(couponCode, orderAmount = 0) {
    try {
      if (!couponCode) {
        return {
          valid: false,
          message: 'Vui lòng nhập mã giảm giá'
        };
      }

      const couponData = await this.repository.getByCode(couponCode);
      
      if (!couponData) {
        return {
          valid: false,
          message: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
        };
      }

      // Kiểm tra giá trị tối thiểu của đơn hàng
      if (orderAmount < couponData.min_order_value) {
        return {
          valid: false,
          message: `Đơn hàng tối thiểu ${couponData.min_order_value.toLocaleString('vi-VN')}đ để sử dụng mã này`
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
    const discountAmount = couponData.discount_value;

    return {
      valid: true,
      coupon_id: couponData.coupon_id,
      discount_amount: discountAmount,
      message: 'Áp dụng mã giảm giá thành công'
    };
  }

  async getAllActiveCoupons() {
    const coupons = await this.repository.getActiveCoupons();
    return coupons;
  }

  async getAllCoupons() {
    try {
      const coupons = await this.repository.getAll();
      return coupons;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách mã giảm giá: ${error.message}`);
    }
  }

  async getCouponById(id) {
    try {
      const coupon = await this.repository.getById(id);
      if (!coupon) {
        throw new Error('Không tìm thấy mã giảm giá');
      }
      return coupon;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin mã giảm giá: ${error.message}`);
    }
  }

  async getCouponByCode(code) {
    try {
      const coupon = await this.repository.getByCode(code);
      if (!coupon) {
        throw new Error('Không tìm thấy mã giảm giá');
      }
      return coupon;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin mã giảm giá: ${error.message}`);
    }
  }

  async createCoupon(couponData) {
    try {
      const newCoupon = await this.repository.create(couponData);
      return newCoupon;
    } catch (error) {
      throw new Error(`Lỗi khi tạo mã giảm giá: ${error.message}`);
    }
  }

  async updateCoupon(id, couponData) {
    try {
      const updatedCoupon = await this.repository.update(id, couponData);
      return updatedCoupon;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật mã giảm giá: ${error.message}`);
    }
  }

  async deleteCoupon(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa mã giảm giá: ${error.message}`);
    }
  }
}
