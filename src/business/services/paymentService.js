import { PaymentRepository } from '../../data/repositories/paymentRepository';
import { OrderService } from './orderService';

export class PaymentService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllPayments() {
    try {
      const payments = await this.repository.getAll();
      return payments;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách thanh toán: ${error.message}`);
    }
  }

  async getPaymentById(id) {
    try {
      const payment = await this.repository.getById(id);
      if (!payment) {
        throw new Error('Không tìm thấy thanh toán');
      }
      return payment;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin thanh toán: ${error.message}`);
    }
  }

  async createPayment(paymentData) {
    try {
      const newPayment = await this.repository.create(paymentData);
      return newPayment;
    } catch (error) {
      throw new Error(`Lỗi khi tạo thanh toán: ${error.message}`);
    }
  }

  async updatePayment(id, paymentData) {
    try {
      const updatedPayment = await this.repository.update(id, paymentData);
      return updatedPayment;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật thanh toán: ${error.message}`);
    }
  }

  async deletePayment(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa thanh toán: ${error.message}`);
    }
  }

  async updatePaymentStatus(paymentId, status, transactionId = null) {
    // Kiểm tra status hợp lệ
    if (!['Pending', 'Completed', 'Failed'].includes(status)) {
      throw new Error('Trạng thái payment không hợp lệ');
    }

    try {
      const updateData = {
        status: status,
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      };

      const payment = await this.repository.update(paymentId, updateData);

      // Nếu thanh toán thành công và có orderService, cập nhật trạng thái đơn hàng thành Processing
      if (status === 'Completed' && payment.order_id && this.orderService) {
        await this.orderService.updateOrderStatus(payment.order_id, 'Processing');
      }

      return payment;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái payment:', error);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId) {
    try {
      return await this.repository.getByOrderId(orderId);
    } catch (error) {
      console.error('Lỗi khi lấy payment theo order_id:', error);
      throw error;
    }
  }
} 