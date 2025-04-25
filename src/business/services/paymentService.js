import { PaymentRepository } from '../../data/repositories/paymentRepository';

export class PaymentService {
  constructor(repository = new PaymentRepository()) {
    this.repository = repository;
  }

  async createPayment(orderId, paymentMethodId, amount) {
    try {
      const paymentData = {
        order_id: orderId,
        payment_method_id: paymentMethodId,
        amount: amount,
        status: 'Pending', // Trạng thái mặc định khi tạo
        transaction_time: new Date().toISOString()
      };

      const payment = await this.repository.create(paymentData);
      return payment;
    } catch (error) {
      console.error('Lỗi khi tạo payment:', error);
      throw error;
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