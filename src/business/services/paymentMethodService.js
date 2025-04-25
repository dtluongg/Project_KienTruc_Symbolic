import { PaymentMethodRepository } from '../../data/repositories/paymentMethodRepository';
import { PaymentMethodModel } from '../models/PaymentMethodModel';

export class PaymentMethodService {
  constructor(repository = new PaymentMethodRepository()) {
    this.repository = repository;
  }

  async getAllPaymentMethods() {
    try {
      const methods = await this.repository.getAll();
      return methods.map(method => new PaymentMethodModel(method).toJSON());
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phương thức thanh toán:', error);
      // Trả về các phương thức thanh toán mặc định nếu có lỗi
      return [
        new PaymentMethodModel({
          method_id: 1,
          method_name: 'Thanh toán khi nhận hàng (COD)',
          description: 'Thanh toán tiền mặt khi nhận được hàng',
          is_active: true
        }).toJSON(),
        new PaymentMethodModel({
          method_id: 2,
          method_name: 'Chuyển khoản ngân hàng',
          description: 'Thanh toán qua chuyển khoản ngân hàng',
          is_active: true
        }).toJSON()
      ];
    }
  }

  async getPaymentMethodById(id) {
    try {
      const method = await this.repository.getById(id);
      if (!method) {
        throw new Error('Không tìm thấy phương thức thanh toán');
      }
      return new PaymentMethodModel(method).toJSON();
    } catch (error) {
      throw new Error(`Lỗi khi lấy phương thức thanh toán: ${error.message}`);
    }
  }

  async createPaymentMethod(methodData) {
    try {
      // Thêm validate nếu cần
      const newMethod = await this.repository.create(methodData);
      return new PaymentMethodModel(newMethod).toJSON();
    } catch (error) {
      throw new Error(`Lỗi khi tạo phương thức thanh toán: ${error.message}`);
    }
  }

  async updatePaymentMethod(id, methodData) {
    try {
      // Thêm validate nếu cần
      const updatedMethod = await this.repository.update(id, methodData);
      return new PaymentMethodModel(updatedMethod).toJSON();
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật phương thức thanh toán: ${error.message}`);
    }
  }

  async deletePaymentMethod(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa phương thức thanh toán: ${error.message}`);
    }
  }
} 