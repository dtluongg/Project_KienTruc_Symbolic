import { supabase } from '../../infrastructure/config/supabase';

export class OrderRepository {
  async createOrder(orderData) {
    try {
      // Chỉ lấy các trường hợp lệ của bảng orders
      const validOrderData = {
        user_id: orderData.user_id,
        recipient_name: orderData.recipient_name,
        recipient_email: orderData.recipient_email,
        recipient_phone: orderData.recipient_phone,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes,
        shipping_method_id: orderData.shipping_method_id,
        coupon_id: orderData.coupon_id,
        discount_amount: orderData.discount_amount,
        total_amount: orderData.total_amount,
        status: orderData.status
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([validOrderData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async createOrderItems(orderItems) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order items:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_methods:shipping_method_id (method_name, base_fee)
        `)
        .eq('user_id', userId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId) {
    try {
      // Get order information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_methods:shipping_method_id (method_name, base_fee)
        `)
        .eq('order_id', orderId)
        .single();

      if (orderError) throw orderError;

      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product_inventory:inventory_id (
            inventory_id,
            product_colors:color_id (
              color_id,
              color_name,
              product_id,
              products:product_id (
                product_id,
                product_name,
                slug,
                base_price
              )
            ),
            product_sizes:size_id (
              size_id,
              size_name
            )
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: orderItems
      };
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }
} 