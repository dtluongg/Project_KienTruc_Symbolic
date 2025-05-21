import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../infrastructure/config/supabase';
import { FiAlertCircle, FiEdit2, FiTrash2, FiEye, FiFilter, FiPlus } from 'react-icons/fi';
import '../styles/managerPage.css';

const OrderManagementPage = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();

  // CRUD modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderForm, setOrderForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    shipping_address: '',
    status: 'Pending',
    total_amount: 0,
  });
  const [editingOrderId, setEditingOrderId] = useState(null);

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Pending', label: 'Chờ xử lý' },
    { value: 'Processing', label: 'Đang xử lý' },
    { value: 'Completed', label: 'Hoàn thành' },
    { value: 'Cancelled', label: 'Đã hủy' }
  ];

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role);
        setLoading(false);
      } catch (error) {
        console.error('Error checking user role:', error);
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  // Định nghĩa fetchOrders ở ngoài cùng
  const fetchOrders = async () => {
    if (userRole !== 'manager') return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*, inventory:product_inventory (*)), user:profiles (*)`)
        .order('order_date', { ascending: false });
      if (error) throw error;
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => { fetchOrders(); }, [userRole]);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  // CRUD handlers
  const openCreateModal = () => {
    setOrderForm({
      recipient_name: '',
      recipient_phone: '',
      recipient_email: '',
      shipping_address: '',
      status: 'Pending',
      total_amount: 0,
    });
    setIsEditMode(false);
    setEditingOrderId(null);
    setIsModalOpen(true);
  };
  const openEditModal = (order) => {
    setOrderForm({
      recipient_name: order.recipient_name || '',
      recipient_phone: order.recipient_phone || '',
      recipient_email: order.recipient_email || '',
      shipping_address: order.shipping_address || '',
      status: order.status || 'Pending',
      total_amount: order.total_amount || 0,
    });
    setIsEditMode(true);
    setEditingOrderId(order.order_id);
    setIsModalOpen(true);
  };
  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };
  const handleOrderFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('orders')
          .update(orderForm)
          .eq('order_id', editingOrderId);
        if (error) throw error;
        alert('Cập nhật đơn hàng thành công!');
      } else {
        const { error } = await supabase
          .from('orders')
          .insert([orderForm]);
        if (error) throw error;
        alert('Tạo đơn hàng thành công!');
      }
      setIsModalOpen(false);
      await fetchOrders();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_id', orderId);
      if (error) throw error;
      alert('Xóa đơn hàng thành công!');
      await fetchOrders();
    } catch (error) {
      alert('Lỗi khi xóa đơn hàng: ' + error.message);
    }
  };

  // View modal handlers
  const openViewModal = (order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-96 bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'manager') {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h2>
            <p className="text-gray-600">Trang này chỉ có quản lý mới được truy cập</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const statusLabels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    const key = status?.toLowerCase();
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[key] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[key] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
            <p className="text-gray-600 mt-2">Xem và quản lý tất cả đơn hàng</p>
          </div>
          <div className="flex items-center space-x-2" style={{color: '#000'}}>
            <button onClick={openCreateModal} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <FiPlus className="mr-2" /> Tạo đơn hàng mới
            </button>
            <FiFilter className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal xem chi tiết đơn hàng */}
        {isViewModalOpen && viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">Chi tiết đơn hàng</h2>
              <div className="space-y-6 text-black">
                {/* Thông tin đơn hàng */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Thông tin đơn hàng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><b>Mã đơn hàng:</b> #{viewOrder.order_id}</div>
                    <div><b>Ngày tạo:</b> {viewOrder.order_date ? new Date(viewOrder.order_date).toLocaleString('vi-VN') : ''}</div>
                    <div><b>Trạng thái:</b> {getStatusBadge(viewOrder.status)}</div>
                    <div><b>Tổng tiền:</b> {viewOrder.total_amount?.toLocaleString('vi-VN')}đ</div>
                    <div><b>Giảm giá:</b> {viewOrder.discount_amount ? viewOrder.discount_amount.toLocaleString('vi-VN') + 'đ' : '0đ'}</div>
                    <div><b>Ghi chú:</b> {viewOrder.notes || 'Không có'}</div>
                  </div>
                </div>
                {/* Thông tin khách hàng */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><b>Họ tên:</b> {viewOrder.recipient_name || viewOrder.user?.full_name || 'Không có'}</div>
                    <div><b>Email:</b> {viewOrder.recipient_email || viewOrder.user?.email || 'Không có'}</div>
                    <div><b>Số điện thoại:</b> {viewOrder.recipient_phone || viewOrder.user?.phone_number || 'Không có'}</div>
                    <div><b>Địa chỉ:</b> {viewOrder.shipping_address || 'Không có'}</div>
                  </div>
                </div>
                {/* Sản phẩm trong đơn hàng */}
                {Array.isArray(viewOrder.order_items) && viewOrder.order_items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Sản phẩm</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-1 border">SKU</th>
                            <th className="px-2 py-1 border">Số lượng</th>
                            <th className="px-2 py-1 border">Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewOrder.order_items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-2 py-1 border">{item.inventory?.sku || ''}</td>
                              <td className="px-2 py-1 border">{item.quantity}</td>
                              <td className="px-2 py-1 border">{item.price_at_order ? item.price_at_order.toLocaleString('vi-VN') + 'đ' : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo/sửa đơn hàng */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg text-black">
              <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng mới'}</h2>
              <form onSubmit={handleOrderFormSubmit} className="space-y-4">
                <input name="recipient_name" value={orderForm.recipient_name} onChange={handleOrderFormChange} placeholder="Tên người nhận" className="w-full border px-3 py-2 rounded" required />
                <input name="recipient_phone" value={orderForm.recipient_phone} onChange={handleOrderFormChange} placeholder="Số điện thoại" className="w-full border px-3 py-2 rounded" required />
                <input name="recipient_email" value={orderForm.recipient_email} onChange={handleOrderFormChange} placeholder="Email" className="w-full border px-3 py-2 rounded" />
                <input name="shipping_address" value={orderForm.shipping_address} onChange={handleOrderFormChange} placeholder="Địa chỉ giao hàng" className="w-full border px-3 py-2 rounded" required />
                <input name="total_amount" type="number" value={orderForm.total_amount} onChange={handleOrderFormChange} placeholder="Tổng tiền" className="w-full border px-3 py-2 rounded" required />
                <select name="status" value={orderForm.status} onChange={handleOrderFormChange} className="w-full border px-3 py-2 rounded">
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="Completed">Hoàn thành</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{isEditMode ? 'Cập nhật' : 'Tạo mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.full_name || order.recipient_name || 'Khách hàng'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.total_amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.order_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementPage; 