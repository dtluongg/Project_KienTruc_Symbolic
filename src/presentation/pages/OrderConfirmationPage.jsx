import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import { formatPrice } from '../../infrastructure/utils/format';
import { formatDate } from '../../infrastructure/utils/format';
import { OrderService } from '../../business/services/orderService';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!order && orderId) {
        try {
          setLoading(true);
          const orderService = new OrderService();
          const orderDetails = await orderService.getOrderDetails(orderId);
          if (orderDetails) {
            setOrder(orderDetails);
          } else {
            setError('Không tìm thấy thông tin đơn hàng');
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin đơn hàng:', error);
          setError('Đã xảy ra lỗi khi lấy thông tin đơn hàng');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto bg-[#1a1d29] p-8 rounded-lg border border-gray-700">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
            <Link 
              to="/" 
              className="inline-block px-6 py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-black transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/" />;
  }

  // Kiểm tra xem phương thức thanh toán có phải là chuyển khoản ngân hàng không
  const isBankTransfer = order.payment_method?.method_name?.toLowerCase().includes('bank');
  
  // Tạo thông tin cho mã VietQR
  const bankId = 'MB';
  const accountNo = '0522714563';
  const accountName = 'TRAN TRONG HUY';
  const amount = Math.round(order.total_amount).toString(); // Làm tròn số và chuyển thành chuỗi
  const description = `DH${order.order_id}`; // Thêm tiền tố "DH" vào mã đơn hàng
  
  // Tạo URL VietQR
  const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-3xl mx-auto bg-[#1a1d29] p-8 rounded-lg border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Đặt hàng thành công!</h1>
          <p className="text-gray-300 mt-2">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.
          </p>
        </div>

        <div className="bg-[#0f111a] p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Thông tin đơn hàng</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Mã đơn hàng:</p>
              <p className="text-white font-medium">#{order.order_id}</p>
            </div>
            <div>
              <p className="text-gray-400">Ngày đặt hàng:</p>
              <p className="text-white font-medium">{formatDate(order.order_date)}</p>
            </div>
            <div>
              <p className="text-gray-400">Trạng thái:</p>
              <p className="text-white font-medium">
                <span className="inline-block px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                  {order.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">Tổng tiền:</p>
              <p className="text-white font-bold">{formatPrice(order.total_amount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f111a] p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Thông tin người nhận</h2>
          
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-400">Họ tên:</p>
              <p className="text-white">{order.recipient_name}</p>
            </div>
            {order.recipient_email && (
              <div>
                <p className="text-gray-400">Email:</p>
                <p className="text-white">{order.recipient_email}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Số điện thoại:</p>
              <p className="text-white">{order.recipient_phone}</p>
            </div>
            <div>
              <p className="text-gray-400">Địa chỉ giao hàng:</p>
              <p className="text-white">{order.shipping_address}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f111a] p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Phương thức giao hàng</h2>
          <p className="text-white">
            {order.shipping_methods?.method_name} - {order.shipping_methods?.base_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_methods?.base_fee)}
          </p>
        </div>

        {/* Phần VietQR - Chỉ hiển thị khi phương thức thanh toán là chuyển khoản ngân hàng */}
        {isBankTransfer && (
          <div className="bg-[#0f111a] p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Thanh toán chuyển khoản</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-4 rounded-lg mb-4">
                <img 
                  src={vietQrUrl} 
                  alt="Mã QR thanh toán" 
                  className="max-w-full h-auto" 
                  style={{ width: '250px', height: '250px' }}
                />
              </div>
              <p className="text-white text-center font-medium">Quét mã QR để thanh toán</p>
            </div>
            
            <div className="space-y-2 text-sm mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Ngân hàng:</p>
                  <p className="text-white">MB Bank</p>
                </div>
                <div>
                  <p className="text-gray-400">Số tài khoản:</p>
                  <p className="text-white">{accountNo}</p>
                </div>
                <div>
                  <p className="text-gray-400">Chủ tài khoản:</p>
                  <p className="text-white">{accountName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Số tiền:</p>
                  <p className="text-white font-bold">{formatPrice(order.total_amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Nội dung chuyển khoản:</p>
                  <p className="text-white font-mono">{description}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-900 bg-opacity-30 p-4 rounded-lg text-sm">
              <p className="text-blue-300 font-medium">Lưu ý:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-200">
                <li>Đơn hàng của bạn sẽ được xử lý sau khi chúng tôi nhận được thanh toán.</li>
                <li>Vui lòng nhập chính xác nội dung chuyển khoản để chúng tôi có thể xác nhận đơn hàng nhanh chóng.</li>
                <li>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline: 0123456789.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-6 py-3 bg-[#2d2d2d] text-white rounded-full text-center hover:bg-black transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link 
            to="/account/orders" 
            className="px-6 py-3 bg-white text-black rounded-full text-center hover:bg-gray-200 transition-colors"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 