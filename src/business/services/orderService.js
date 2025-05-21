import { OrderRepository } from '../../data/repositories/orderRepository';
import { CouponService } from './CouponService';
import { ShippingMethodService } from './shippingMethodService';
import { PaymentService } from './paymentService';

export class OrderService {
  constructor(repository) {
    this.repository = repository;
    this.couponService = new CouponService();
    this.shippingMethodService = new ShippingMethodService();
    this.paymentService = new PaymentService(undefined, this);
  }

  async getAllOrders() {
    try {
      const orders = await this.repository.getAll();
      return orders;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
  }

  async getOrderById(id) {
    try {
      const order = await this.repository.getById(id);
      if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      return order;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin đơn hàng: ${error.message}`);
    }
  }

  async createOrder(orderData, cartItems) {
    console.log('OrderService.createOrder - cartItems:', JSON.stringify(cartItems, null, 2));
    
    try {
      // 1. Kiểm tra dữ liệu đầu vào
      if (!orderData || !cartItems || cartItems.length === 0) {
        return {
          success: false, 
          message: 'Dữ liệu đơn hàng không hợp lệ hoặc giỏ hàng trống'
        };
      }
      
      // 2. Kiểm tra inventory_id cho mỗi sản phẩm
      const itemsWithInventoryId = cartItems.map(item => {
        if (!item.inventoryId) {
          console.error('Thiếu inventoryId cho sản phẩm:', item);
          throw new Error(`Thiếu inventoryId cho sản phẩm: ${item.product.product_name}`);
        }
        return {
          ...item,
          price: item.finalPrice
        };
      });
      
      // 3. Tính tổng giá trị các sản phẩm
      const subtotal = this.calculateOrderSubtotal(itemsWithInventoryId);
      
      // 4. Lấy phí vận chuyển từ shipping method
      const shippingMethod = await this.shippingMethodService.getShippingMethodById(orderData.shipping_method_id);
      const shippingFee = shippingMethod ? shippingMethod.base_fee : 0;
      
      // 5. Tính tổng giá trị sau khi áp dụng giảm giá và phí vận chuyển
      orderData.total_amount = this.calculateOrderTotal(
        subtotal, 
        orderData.discount_amount || 0, 
        shippingFee
      );
      
      // 6. Thêm trạng thái mặc định cho đơn hàng
      orderData.status = 'Pending';
      
      // 7. Tạo đơn hàng
      const order = await this.repository.create(orderData);
      
      if (!order || !order.order_id) {
        throw new Error('Không thể tạo đơn hàng, thiếu order_id');
      }
      
      // 8. Tạo order items
      const orderItems = itemsWithInventoryId.map(item => ({
        order_id: order.order_id,
        inventory_id: item.inventoryId,
        quantity: item.quantity,
        price_at_order: item.price * item.quantity
      }));
      
      await this.repository.createOrderItems(orderItems);
      
      // 9. Cập nhật số lần sử dụng mã giảm giá
      if (orderData.coupon_id) {
        await this.couponService.couponRepository.updateCouponUsage(orderData.coupon_id);
      }

      // 10. Tạo payment record
      await this.paymentService.createPayment(
        order.order_id,
        orderData.payment_method_id,
        orderData.total_amount
      );

      // 11. Lấy thông tin chi tiết đơn hàng
      const orderDetails = await this.repository.getOrderDetails(order.order_id);
      
      return {
        success: true,
        message: 'Đặt hàng thành công',
        order: orderDetails
      };
      
    } catch (error) {
      console.error('Lỗi trong OrderService.createOrder:', error);
      return {
        success: false,
        message: error.message || 'Lỗi khi tạo đơn hàng'
      };
    }
  }

  // Tính tổng giá trị các sản phẩm
  calculateOrderSubtotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Tính tổng giá trị đơn hàng sau khi áp dụng giảm giá và phí vận chuyển
  calculateOrderTotal(subtotal, discountAmount, shippingFee) {
    return Math.max(0, subtotal - discountAmount) + shippingFee;
  }

  // Phương thức hỗ trợ để lấy inventoryId từ colorId và sizeId
  _getInventoryIdFromColorAndSize(productId, colorId, sizeId) {
    // Cài đặt phương thức này để truy vấn inventoryId dựa trên productId, colorId và sizeId
    // Đây chỉ là phương thức giả, cần triển khai thực tế
    console.warn('Cần triển khai phương thức _getInventoryIdFromColorAndSize');
    return null;
  }

  async getOrdersByUser(userId) {
    return await this.repository.getOrdersByUser(userId);
  }

  async getOrderDetails(orderId) {
    return await this.repository.getOrderDetails(orderId);
  }

  async updateOrderStatus(orderId, status) {
    try {
      // Kiểm tra status hợp lệ
      if (!['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].includes(status)) {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      const order = await this.repository.updateOrderStatus(orderId, status);
      return order;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
      throw error;
    }
  }

  async updateOrder(id, orderData) {
    try {
      const updatedOrder = await this.repository.update(id, orderData);
      return updatedOrder;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật đơn hàng: ${error.message}`);
    }
  }

  async deleteOrder(id) {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa đơn hàng: ${error.message}`);
    }
  }
} 