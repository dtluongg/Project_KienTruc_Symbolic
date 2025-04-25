import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPrice } from '../../infrastructure/utils/format';
import { ProductService } from '../../business/services/productService';
import { OrderService } from '../../business/services/orderService';
import { ProductRepository } from '../../data/repositories/productRepository';
import { ShippingMethodService } from '../../business/services/shippingMethodService';
import { PaymentMethodService } from '../../business/services/paymentMethodService';
import { FiX, FiTag } from 'react-icons/fi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    totalPrice, 
    clearCart, 
    selectedShippingMethod, 
    setSelectedShippingMethod, 
    calculateTotal,
    coupon,
    discountAmount,
    removeCoupon,
    couponError,
    setCouponError,
    applyCoupon
  } = useCart();
  const { user } = useUser();
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || '',
    recipient_email: user?.email || '',
    recipient_phone: user?.phone_number || '',
    shipping_address: user?.address || '',
    notes: ''
  });

  // Kiểm tra xem có sản phẩm trong giỏ hàng không
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Fetch shipping methods và payment methods chỉ khi trang được tải
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoading(true);
        const shippingMethodService = new ShippingMethodService();
        const paymentMethodService = new PaymentMethodService();
        
        // Lấy phương thức vận chuyển từ service riêng biệt
        const shippingMethodsData = await shippingMethodService.getAllShippingMethods();
        setShippingMethods(shippingMethodsData);
        
        // Nếu chưa có shipping method được chọn từ Cart, thì mặc định chọn miễn phí vận chuyển hoặc phương thức đầu tiên
        if (!selectedShippingMethod && shippingMethodsData.length > 0) {
          const freeShipping = shippingMethodsData.find(m => m.method_name === 'Giao hàng miễn phí');
          setSelectedShippingMethod(freeShipping || shippingMethodsData[0]);
        }
        
        // Lấy phương thức thanh toán từ service riêng biệt
        const paymentMethodsData = await paymentMethodService.getAllPaymentMethods();
        setPaymentMethods(paymentMethodsData);
        
        if (paymentMethodsData.length > 0) {
          const codPayment = paymentMethodsData.find(m => m.method_name.includes('COD'));
          setSelectedPaymentMethod(codPayment || paymentMethodsData[0]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Không thể tải dữ liệu, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
    // Sử dụng empty array để chỉ gọi một lần khi component mount
  }, []);

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode.trim());
    
    if (success) {
      setCouponCode(''); // Xóa input sau khi áp dụng thành công
    }
    
    setIsApplyingCoupon(false);
  };

  // Xử lý đặt hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Kiểm tra xem đã chọn phương thức vận chuyển và thanh toán chưa
    if (!selectedShippingMethod) {
      setError('Vui lòng chọn phương thức vận chuyển');
      setSubmitting(false);
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      setSubmitting(false);
      return;
    }

    const orderData = {
      ...formData,
      user_id: user?.user_id,
      shipping_method_id: selectedShippingMethod.method_id,
      payment_method_id: selectedPaymentMethod.method_id,
      coupon_id: coupon ? coupon.coupon_id : null,
      discount_amount: discountAmount || 0
    };

    console.log('Checking cart items before submission:', JSON.stringify(cartItems, null, 2));

    try {
      const orderService = new OrderService();
      const result = await orderService.createOrder(orderData, cartItems);
      
      if (result.success) {
        // Xóa giỏ hàng sau khi đặt hàng thành công
        clearCart();
        
        // Chuyển hướng đến trang thanh toán QR với thông tin đơn hàng
        navigate(`/payment-qr/${result.order.order_id}`, {
          state: { order: result.order }
        });
      } else {
        setError(result.message || 'Đã xảy ra lỗi khi đặt hàng.');
      }
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      setError('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-8 text-white">Thanh toán</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1a1d29] p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Thông tin giao hàng</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-300 mb-1">
                    Họ tên người nhận <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded-lg text-white"
                    placeholder="Nhập họ tên"
                  />
                </div>
                
                <div>
                  <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="recipient_email"
                    name="recipient_email"
                    value={formData.recipient_email}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded-lg text-white"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div>
                  <label htmlFor="recipient_phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Số điện thoại <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="recipient_phone"
                    name="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded-lg text-white"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-300 mb-1">
                    Địa chỉ giao hàng <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded-lg text-white"
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-3 bg-[#0f111a] border border-gray-700 rounded-lg text-white"
                    placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[#1a1d29] p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Phương thức vận chuyển</h2>
              
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <div key={method.method_id} className="flex items-center py-2">
                    <input
                      type="radio"
                      id={`shipping-${method.method_id}`}
                      name="shipping-method"
                      checked={selectedShippingMethod?.method_id === method.method_id}
                      onChange={() => setSelectedShippingMethod(method)}
                      className="mr-3"
                    />
                    <label htmlFor={`shipping-${method.method_id}`} className="flex justify-between w-full text-white">
                      <span>{method.method_name}</span>
                      <span>{method.base_fee === 0 ? 'Miễn phí' : formatPrice(method.base_fee)}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#1a1d29] p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Phương thức thanh toán</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.method_id} className="flex items-center py-2">
                    <input
                      type="radio"
                      id={`payment-${method.method_id}`}
                      name="payment-method"
                      checked={selectedPaymentMethod?.method_id === method.method_id}
                      onChange={() => setSelectedPaymentMethod(method)}
                      className="mr-3"
                    />
                    <label htmlFor={`payment-${method.method_id}`} className="flex flex-col w-full text-white">
                      <span className="font-medium">{method.method_name}</span>
                      {method.description && (
                        <span className="text-sm text-gray-400">{method.description}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1d29] p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Mã giảm giá</h2>
              
              {coupon ? (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-medium">{coupon.code}</span>
                    <p className="text-sm text-green-400">
                      Giảm {formatPrice(discountAmount)}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={removeCoupon}
                    className="flex items-center text-gray-400 hover:text-red-400"
                  >
                    <span className="mr-1">Xóa</span>
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleApplyCoupon} className="flex">
                    <div className="flex-grow relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiTag className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full p-3 pl-10 bg-[#0f111a] border border-gray-700 rounded-l-lg text-white"
                        placeholder="Nhập mã giảm giá"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-3 bg-[#2d2d2d] text-white rounded-r-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                    </button>
                  </form>
                  
                  {couponError && (
                    <p className="text-sm text-red-400 mt-2">{couponError}</p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-[#1a1d29] p-6 rounded-lg border border-gray-700 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-white">Đơn hàng của bạn</h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-700">
                  <div className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0]?.image_url}
                      alt={item.product.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-white font-medium">{item.product.product_name}</p>
                    <div className="text-xs text-gray-400">
                      <p>Màu: {item.color.color_name}</p>
                      <p>Kích thước: {item.size.size_name}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-300">x{item.quantity}</span>
                      <span className="text-white">{formatPrice(item.finalPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Tạm tính</span>
                <span className="text-white">{formatPrice(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Phí vận chuyển</span>
                <span className="text-white">
                  {selectedShippingMethod?.base_fee === 0 
                    ? 'Miễn phí' 
                    : formatPrice(selectedShippingMethod?.base_fee || 0)}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-700">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-white">Tổng cộng</span>
                  <span className="font-bold text-white">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-black transition-colors mt-6 disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 