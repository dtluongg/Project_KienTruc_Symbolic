import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../infrastructure/config/supabase';
import { FiUsers, FiShoppingBag, FiDollarSign, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
import StatsService from '../../business/services/StatsService';
import '../styles/managerPage.css';


const ManagerPage = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenueAllOrders: 0,
    totalRevenuePendingOrders: 0,
    totalRevenueProcessingOrders: 0,
    totalRevenueCompletedOrders: 0,
    totalRevenueCancelledOrders: 0
  });
  const navigate = useNavigate();
  const statsService = new StatsService();

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

  useEffect(() => {
    const fetchStats = async () => {
      if (userRole !== 'manager') return;

      try {
        const dashboardStats = await statsService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userRole]);

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

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Trang Quản Lý</h1>
          <p className="text-gray-600">Quản lý và theo dõi hoạt động của cửa hàng</p>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số người dùng</p>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiShoppingBag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số sản phẩm</p>
                <p className="text-2xl font-semibold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiBarChart2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số đơn hàng</p>
                <p className="text-2xl font-semibold">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu ước tính</p>
                <p className="text-2xl font-semibold">{stats.totalRevenueAllOrders.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Các chức năng quản lý */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Quản lý sản phẩm</h2>
            <p className="text-gray-600 mb-4">Thêm, sửa, xóa sản phẩm và quản lý danh mục</p>
            <button
              onClick={() => navigate('/product-management')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Quản lý sản phẩm
            </button>
          </div>

          <div className="nav-quanly bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Quản lý đơn hàng</h2>
            <p className="text-gray-600 mb-4">Xem và xử lý các đơn hàng của khách hàng</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Quản lý đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage; 