import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../infrastructure/config/supabase';
import { formatPrice } from '../../infrastructure/utils/format';

const PaymentQRPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút tính bằng giây
    const [checkingPayment, setCheckingPayment] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                console.log('Fetching order with ID:', orderId);
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        shipping_methods:shipping_method_id(*),
                        payment_methods:payment_method_id(*),
                        order_items(
                            *,
                            product:product_id(*)
                        )
                    `)
                    .eq('order_id', orderId)
                    .single();

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                console.log('Order data received:', data);
                if (data) {
                    setOrder(data);
                } else {
                    console.log('No order data found');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!order) {
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [orderId, order]);

    // Kiểm tra giao dịch
    const checkTransaction = async () => {
        try {
            const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhY9lI3PXkxAs5xUzO2k2rT8eTO4ttaX3NUHejoApzXrRn8sQG-tLXghkDHnz2FiIjUoDnb4FPgYUVuRZ_X3kSxtMythcdaLOBdeR19nGOGoCH2KPDWS45hKuOWGMNA_PGq92EkEXKQszCOwYrerIcLv4vt2tGvTMvKFzLcW2O1H-wb4YlZNavM5_7v1Ndv9VrYr2DEh_zwvNmUpVgmqwRuhhB-ry9wMcSidAkQ2vR7x3WLR1c_C6p-cl31__qMI6gP_YtlBW-ho8fRZpRXy8Wclimeeg&lib=MC0roSzFg1gXYXnvZZGv30CfPPMPv82Iw');
            const data = await response.json();
            
            if (!data.error && data.data.length > 0) {
                const latestTransaction = data.data[data.data.length - 1];
                
                // Kiểm tra nếu giao dịch khớp với đơn hàng
                if (latestTransaction["Số tài khoản"] === "0522714563" && 
                    latestTransaction["Giá trị"] === order.total_amount &&
                    latestTransaction["Mô tả"].includes(`DH${orderId}`)) {
                    
                    // Lấy thông tin payment
                    const { data: payment, error: paymentError } = await supabase
                        .from('payments')
                        .select('payment_id')
                        .eq('order_id', orderId)
                        .single();

                    if (!paymentError && payment) {
                        // Cập nhật trạng thái payment thành Completed
                        const { error: updateError } = await supabase
                            .from('payments')
                            .update({ 
                                status: 'Completed',
                                transaction_id: latestTransaction["Mã GD"].toString(),
                                payment_date: new Date().toISOString()
                            })
                            .eq('payment_id', payment.payment_id);

                        if (!updateError) {
                            // Chuyển đến trang xác nhận, order vẫn giữ trạng thái Pending
                            navigate(`/order-confirmation/${orderId}`, {
                                state: { order: { ...order } }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking transaction:', error);
        }
    };

    useEffect(() => {
        // Đếm ngược thời gian
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Kiểm tra giao dịch mỗi giây
        const paymentChecker = setInterval(() => {
            if (!checkingPayment && order) {
                setCheckingPayment(true);
                checkTransaction().finally(() => setCheckingPayment(false));
            }
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(paymentChecker);
        };
    }, [order]);

    // Tạo URL VietQR
    const generateVietQRUrl = () => {
        if (!order || !order.total_amount) {
            console.log('Cannot generate QR: missing order or total_amount', order);
            return '';
        }
        
        // Thông tin ngân hàng MB Bank
        const bankId = "MB"; // Mã ngân hàng MB
        const accountNo = "0522714563"; // Số tài khoản
        const accountName = "TRAN TRONG HUY"; // Tên tài khoản
        
        // Format số tiền (không có dấu phẩy hoặc dấu chấm)
        const amount = Math.round(parseFloat(order.total_amount)).toString();
        
        // Nội dung chuyển khoản
        const description = `DH${orderId}`; // Thêm tiền tố "DH" vào mã đơn hàng
        
        // Tạo URL VietQR theo format mới
        const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(accountName)}`;
        
        console.log('Generated QR URL:', url);
        return url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
                <div className="text-xl font-semibold text-white">Đang tải...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
                <div className="text-xl font-semibold text-white">Không tìm thấy thông tin đơn hàng</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f111a] py-8">
            <div className="bg-[#1a1d29] p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white">Thanh toán đơn hàng</h2>
                <div className="mb-6">
                    <p className="text-lg font-semibold mb-2 text-white">
                        Tổng tiền: {formatPrice(parseFloat(order.total_amount))}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">Mã đơn hàng: #{orderId}</p>
                    
                    <div className="text-yellow-400 mb-4">
                        Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg mb-6">
                        <img 
                            src={generateVietQRUrl()} 
                            alt="VietQR Payment Code" 
                            className="mx-auto max-w-full h-auto"
                        />
                    </div>
                    
                    <div className="text-left mb-6 bg-[#0f111a] p-4 rounded-lg">
                        <p className="text-sm text-gray-300 mb-1">Ngân hàng: <span className="text-white">MB Bank</span></p>
                        <p className="text-sm text-gray-300 mb-1">Số tài khoản: <span className="text-white">0522714563</span></p>
                        <p className="text-sm text-gray-300 mb-1">Chủ tài khoản: <span className="text-white">TRAN TRONG HUY</span></p>
                        <p className="text-sm text-gray-300">Nội dung: <span className="text-white font-mono">DH{orderId}</span></p>
                    </div>

                    <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg text-sm">
                        <p className="text-blue-300 font-medium mb-2">Lưu ý:</p>
                        <ul className="list-disc pl-5 space-y-1 text-blue-200">
                            <li>Vui lòng chuyển khoản chính xác số tiền và nội dung như trên</li>
                            <li>Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được thanh toán</li>
                            <li>Nếu cần hỗ trợ, vui lòng liên hệ hotline: 0522714563</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentQRPage; 