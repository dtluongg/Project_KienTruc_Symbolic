import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { supabase } from '../../infrastructure/config/supabase';
import { FiEdit, FiX, FiUpload } from 'react-icons/fi';

const UserProfile = () => {
  const { user, logout, loading, getUserProfile } = useUser();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: user.getFullName() || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setErrorMsg('');

      if (!event.target.files || event.target.files.length === 0) {
        setErrorMsg('Vui lòng chọn một hình ảnh để tải lên.');
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Lấy URL công khai của file
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Lỗi khi tải lên avatar:', error.message);
      setErrorMsg('Lỗi khi tải lên avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      // Cập nhật thông tin trong bảng profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Đồng bộ lại thông tin
      await fetchProfile();
      setIsEditModalOpen(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error.message);
      setErrorMsg('Lỗi khi cập nhật thông tin: ' + error.message);
    } finally {
      setUploading(false);
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
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-2 border-4 border-indigo-100 bg-gray-200">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Avatar';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-4xl">
                      {user.getFullName()?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thông tin người dùng */}
              <div className="flex-1">
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
            </div>
            <div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                onClick={() => setIsEditModalOpen(true)}
              >
                <FiEdit className="mr-2" /> Cập nhật thông tin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cập nhật thông tin */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Cập nhật thông tin</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6">
              {/* Avatar upload */}
              <div className="mb-6 flex flex-col items-center">
                <div 
                  onClick={handleAvatarClick}
                  className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-indigo-200 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Avatar';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                      <FiUpload size={30} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {avatarUrl ? 'Thay đổi ảnh đại diện' : 'Tải lên ảnh đại diện'}
                </button>
                {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
              </div>
              
              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;