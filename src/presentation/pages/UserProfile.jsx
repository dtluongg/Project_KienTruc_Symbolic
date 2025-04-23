import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const UserProfile = () => {
  const { user, logout, loading, getUserProfile } = useUser();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      if (user.profile) {
        setProfile(user.profile);
      } else {
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/auth');
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-xl font-semibold text-gray-800">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Đăng xuất
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">ID</h3>
                  <p className="text-gray-900 truncate" title={user.id}>{user.id}</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Họ và tên</h3>
                  <p className="text-gray-900">{user.getFullName() || 'Chưa cập nhật'}</p>
                </div>
                
                {profile && (
                  <>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Vai trò</h3>
                      <p className="text-gray-900">{profile.role || 'Người dùng'}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Số điện thoại</h3>
                      <p className="text-gray-900">{profile.phone_number || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Địa chỉ</h3>
                      <p className="text-gray-900">{profile.address || 'Chưa cập nhật'}</p>
                    </div>
                  </>
                )}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Đã tạo lúc</h3>
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Đăng nhập gần nhất</h3>
                  <p className="text-gray-900">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('vi-VN') : 'Không có thông tin'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => console.log('Cập nhật thông tin')}
              >
                Cập nhật thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;