import { ShippingMethodRepository } from '../../data/repositories/shippingMethodRepository';

export class ShippingMethodService {
  constructor(repository = new ShippingMethodRepository()) {
    this.repository = repository;
  }

  async getAllShippingMethods() {
    try {
      const methods = await this.repository.getAll();
      return methods;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phương thức vận chuyển:', error);
      // Trả về các phương thức vận chuyển mặc định nếu có lỗi
      return [
        {
          method_id: 1,
          method_name: 'Giao hàng miễn phí',
          base_fee: 0,
          estimated_days: '5-7 ngày',
          is_active: true
        },
        {
          method_id: 2,
          method_name: 'Giao hàng tiêu chuẩn',
          base_fee: 30000,
          estimated_days: '3-5 ngày',
          is_active: true
        },
        {
          method_id: 3,
          method_name: 'Giao hàng nhanh',
          base_fee: 60000,
          estimated_days: '1-2 ngày',
          is_active: true
        }
      ];
    }
  }

  async getShippingMethodById(id) {
    try {
      const method = await this.repository.getById(id);
      if (!method) {
        throw new Error('Không tìm thấy phương thức vận chuyển');
      }
      return method;
    } catch (error) {
      throw new Error(`Lỗi khi lấy phương thức vận chuyển: ${error.message}`);
    }
  }

  async createShippingMethod(methodData) {
    try {
      // Thêm validate nếu cần
      const newMethod = await this.repository.create(methodData);
      return newMethod;
    } catch (error) {
      throw new Error(`Lỗi khi tạo phương thức vận chuyển: ${error.message}`);
    }
  }

  async updateShippingMethod(id, methodData) {
    try {
      // Thêm validate nếu cần
      const updatedMethod = await this.repository.update(id, methodData);
      return updatedMethod;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật phương thức vận chuyển: ${error.message}`);
    }
  }

  async deleteShippingMethod(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa phương thức vận chuyển: ${error.message}`);
    }
  }
} 