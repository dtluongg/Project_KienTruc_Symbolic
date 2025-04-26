import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../../infrastructure/utils/format';
import { ShippingMethodService } from '../../business/services/shippingMethodService';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    selectedShippingMethod, 
    setSelectedShippingMethod,
    calculateTotal,
    coupon,
    discountAmount,
    couponLoading,
    couponError,
    setCouponError,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Fetch shipping methods chỉ khi trang được tải lần đầu
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        setLoading(true);
        const shippingMethodService = new ShippingMethodService();
        const methods = await shippingMethodService.getAllShippingMethods();
        setShippingMethods(methods);
        
        // Nếu chưa có shipping method được chọn, thì mặc định chọn miễn phí vận chuyển hoặc phương thức đầu tiên
        if (!selectedShippingMethod && methods.length > 0) {
          const freeShipping = methods.find(m => m.method_name === 'Giao hàng miễn phí');
          setSelectedShippingMethod(freeShipping || methods[0]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy phương thức vận chuyển:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingMethods();
    // Chỉ gọi một lần khi component mount
  }, []);

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

  // Xử lý chuyển đến trang thanh toán
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center mt-20">
        <div className="flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto">
          <FiShoppingBag size={64} className="text-gray-400" />
          <h2 className="text-2xl font-semibold text-white">Giỏ hàng trống</h2>
          <p className="text-gray-300">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy tiếp tục mua sắm để thêm sản phẩm.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-black transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-8 text-white">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Sản phẩm ({cartItems.length})
            </h2>
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <FiTrash2 />
              <span>Xóa tất cả</span>
            </button>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row border border-gray-700 rounded-lg p-4 gap-4 bg-[#1a1d29]"
            >
              <div className="md:w-24 h-24 rounded-md overflow-hidden bg-white">
                <img
                  src={item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0]?.image_url}
                  alt={item.product.product_name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between mb-1">
                  <Link to={`/product/${item.product.slug}`} className="font-semibold text-white hover:underline">
                    {item.product.product_name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <div className="text-sm text-gray-300 mb-2">
                  <p>Màu: {item.color.color_name}</p>
                  <p>Kích thước: {item.size.size_name}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full border border-gray-500 text-white hover:border-gray-300"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full border border-gray-500 text-white hover:border-gray-300"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatPrice(item.finalPrice * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatPrice(item.finalPrice)} / sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-gray-700 rounded-lg p-6 sticky top-24 bg-[#1a1d29]">
            <h2 className="text-xl font-semibold mb-4 text-white">Tổng giỏ hàng</h2>

            {/* Mã giảm giá */}
            <div className="mb-4">
              <h3 className="text-md font-medium text-white mb-2">Mã giảm giá</h3>
              
              {coupon ? (
                <div className="bg-gray-800 p-3 rounded-lg mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{coupon.code}</span>
                      <p className="text-sm text-green-400">
                        Giảm {formatPrice(discountAmount)}
                      </p>
                    </div>
                    <button 
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex mb-2">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiTag className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full p-2 pl-10 bg-gray-800 border border-gray-700 rounded-l-lg text-white"
                      placeholder="Nhập mã giảm giá"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-[#2d2d2d] text-white rounded-r-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </form>
              )}
              
              {couponError && (
                <p className="text-sm text-red-400 mt-1">{couponError}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Tạm tính</span>
                <span className="font-medium text-white">{formatPrice(totalPrice)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              
              {/* Phương thức vận chuyển */}
              {loading ? (
                <div className="py-2 text-gray-400">Đang tải phương thức vận chuyển...</div>
              ) : (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Phương thức vận chuyển</h3>
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <div key={method.method_id} className="flex items-center">
                        <input
                          type="radio"
                          id={`shipping-${method.method_id}`}
                          name="shipping-method"
                          checked={selectedShippingMethod?.method_id === method.method_id}
                          onChange={() => setSelectedShippingMethod(method)}
                          className="mr-2"
                        />
                        <label htmlFor={`shipping-${method.method_id}`} className="flex justify-between w-full text-white">
                          <span>{method.method_name}</span>
                          <span>{method.base_fee === 0 ? 'Miễn phí' : formatPrice(method.base_fee)}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-3">
                <span className="text-gray-300">Phí vận chuyển</span>
                <span className="font-medium text-white">
                  {selectedShippingMethod?.base_fee === 0 
                    ? 'Miễn phí' 
                    : formatPrice(selectedShippingMethod?.base_fee || 0)}
                </span>
              </div>

              <div className="border-t border-gray-700 my-4"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-white">Tổng cộng</span>
                <span className="font-bold text-lg text-white">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={!selectedShippingMethod}
              className="w-full py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiến hành thanh toán
            </button>

            <Link
              to="/products"
              className="block text-center mt-4 text-gray-300 hover:text-white hover:underline"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 