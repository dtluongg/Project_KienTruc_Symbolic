import { PaymentMethodRepository } from '../../data/repositories/paymentMethodRepository';

export class PaymentMethodService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllPaymentMethods() {
    try {
      const methods = await this.repository.getAll();
      return methods;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách phương thức thanh toán: ${error.message}`);
    }
  }

  async getPaymentMethodById(id) {
    try {
      const method = await this.repository.getById(id);
      if (!method) {
        throw new Error('Không tìm thấy phương thức thanh toán');
      }
      return method;
    } catch (error) {
      throw new Error(`Lỗi khi lấy phương thức thanh toán: ${error.message}`);
    }
  }

  async createPaymentMethod(methodData) {
    try {
      const newMethod = await this.repository.create(methodData);
      return newMethod;
    } catch (error) {
      throw new Error(`Lỗi khi tạo phương thức thanh toán: ${error.message}`);
    }
  }

  async updatePaymentMethod(id, methodData) {
    try {
      const updatedMethod = await this.repository.update(id, methodData);
      return updatedMethod;
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