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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalProducts, setModalProducts] = useState([]);
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

  const openOrderModal = async (order, isEdit = false) => {
    setModalOrder(order);
    setEditMode(isEdit);
    setModalStatus(order.status);
    setModalOpen(true);
    // Lấy tên sản phẩm cho từng order_item
    if (order.order_items && order.order_items.length > 0) {
      const products = await Promise.all(order.order_items.map(async (item, idx) => {
        // Lấy inventory
        const { data: inventory } = await supabase
          .from('product_inventory')
          .select('color_id, size_id')
          .eq('inventory_id', item.inventory_id)
          .single();
        if (!inventory) return { ...item, product_name: 'Không xác định', stt: idx + 1 };
        // Lấy color
        const { data: color } = await supabase
          .from('product_colors')
          .select('product_id, color_name, color_id')
          .eq('color_id', inventory.color_id)
          .single();
        // Lấy size
        const { data: size } = await supabase
          .from('product_sizes')
          .select('size_name')
          .eq('size_id', inventory.size_id)
          .single();
        // Lấy product
        const { data: product } = await supabase
          .from('products')
          .select('product_name')
          .eq('product_id', color?.product_id)
          .single();
        // Lấy hình ảnh
        const { data: image } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('color_id', color?.color_id)
          .eq('is_primary', true)
          .single();
        return {
          ...item,
          stt: idx + 1,
          product_name: product?.product_name || 'Không xác định',
          color_name: color?.color_name || '',
          size_name: size?.size_name || '',
          image_url: image?.image_url || '',
        };
      }));
      setModalProducts(products);
    } else {
      setModalProducts([]);
    }
  };

  const closeOrderModal = () => {
    setModalOpen(false);
    setModalOrder(null);
    setEditMode(false);
    setModalProducts([]);
  };

  const handleUpdateStatus = async () => {
    if (!modalOrder) return;
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: modalStatus })
      .eq('order_id', modalOrder.order_id);
    setUpdating(false);
    if (!error) {
      setOrders((prev) => prev.map(o => o.order_id === modalOrder.order_id ? { ...o, status: modalStatus } : o));
      setFilteredOrders((prev) => prev.map(o => o.order_id === modalOrder.order_id ? { ...o, status: modalStatus } : o));
      closeOrderModal();
    } else {
      alert('Có lỗi khi cập nhật trạng thái!');
    }
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
    // Map trạng thái sang tiếng Việt và style
    const statusMap = {
      Pending: { label: 'Chờ xử lý', style: 'bg-yellow-50 border border-yellow-400 text-yellow-800' },
      Processing: { label: 'Đang xử lý', style: 'bg-blue-50 border border-blue-400 text-blue-800' },
      Completed: { label: 'Hoàn thành', style: 'bg-green-50 border border-green-400 text-green-800' },
      Cancelled: { label: 'Đã hủy', style: 'bg-red-50 border border-red-400 text-red-800' },
    };
    const info = statusMap[status] || { label: status, style: 'bg-gray-100 border border-gray-400 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.style}`}>{info.label}</span>
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
              className="block w-60 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-base"
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
                            onClick={() => openOrderModal(order, false)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openOrderModal(order, true)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <FiEdit2 className="h-5 w-5" />
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
        {/* Modal chi tiết/chỉnh sửa đơn hàng */}
        {modalOpen && modalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative text-gray-900">
              <button onClick={closeOrderModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">×</button>
              <h2 className="text-2xl font-bold mb-4">{editMode ? 'Chỉnh sửa đơn hàng' : 'Chi tiết đơn hàng'}</h2>
              <div className="mb-2"><b>Mã đơn hàng:</b> #{modalOrder.order_id}</div>
              <div className="mb-2"><b>Khách hàng:</b> {modalOrder.user?.full_name || modalOrder.recipient_name || 'Khách hàng'}</div>
              <div className="mb-2"><b>Email:</b> {modalOrder.user?.email || modalOrder.recipient_email || '-'}</div>
              <div className="mb-2"><b>Số điện thoại:</b> {modalOrder.user?.phone_number || modalOrder.recipient_phone || '-'}</div>
              <div className="mb-2"><b>Địa chỉ:</b> {modalOrder.shipping_address || modalOrder.user?.address || '-'}</div>
              <div className="mb-2"><b>Ngày đặt:</b> {formatDate(modalOrder.order_date)}</div>
              <div className="mb-2"><b>Tổng tiền:</b> {modalOrder.total_amount.toLocaleString('vi-VN')}đ</div>
              <div className="mb-2"><b>Ghi chú:</b> {modalOrder.notes || '-'}</div>
              <div className="mb-2"><b>Trạng thái:</b> {!editMode ? getStatusBadge(modalOrder.status) : (
                <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} className="border rounded px-2 py-1">
                  {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
              </div>
              <div className="mb-2">
                <b>Danh sách sản phẩm:</b>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 border">STT</th>
                        <th className="px-2 py-1 border">Hình</th>
                        <th className="px-2 py-1 border">Tên sản phẩm</th>
                        <th className="px-2 py-1 border">Size</th>
                        <th className="px-2 py-1 border">Màu</th>
                        <th className="px-2 py-1 border">Số lượng</th>
                        <th className="px-2 py-1 border">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalProducts.map(item => (
                        <tr key={item.item_id}>
                          <td className="px-2 py-1 border text-center">{item.stt}</td>
                          <td className="px-2 py-1 border text-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded mx-auto" />
                            ) : (
                              <span className="text-gray-400">Không có ảnh</span>
                            )}
                          </td>
                          <td className="px-2 py-1 border">{item.product_name}</td>
                          <td className="px-2 py-1 border text-center">{item.size_name}</td>
                          <td className="px-2 py-1 border text-center">{item.color_name}</td>
                          <td className="px-2 py-1 border text-center">{item.quantity}</td>
                          <td className="px-2 py-1 border text-right">{item.price_at_order.toLocaleString('vi-VN')}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {editMode && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementPage; 