import { createContext, useState, useEffect, useContext } from 'react';
import { UserService } from '../../business/services/userService';
import { UserRepository } from '../../data/repositories/userRepository';

// Tạo context cho người dùng
const UserContext = createContext(null);

// Hook để sử dụng UserContext
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Khởi tạo service và repository
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  
  // Kiểm tra phiên đăng nhập khi component được mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Lỗi khi kiểm tra phiên đăng nhập:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Đăng ký lắng nghe sự kiện thay đổi phiên đăng nhập
    const authListener = userRepository.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => {
      // Hủy đăng ký lắng nghe khi unmount
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Các hàm xử lý đăng nhập/đăng xuất
  const login = async (email, password) => {
    setLoading(true);
    const result = await userService.login(email, password);
    setLoading(false);
    return result;
  };
  
  const register = async (email, password, metadata = {}) => {
    setLoading(true);
    const result = await userService.register(email, password, metadata);
    setLoading(false);
    return result;
  };
  
  const logout = async () => {
    setLoading(true);
    const result = await userService.logout();
    setLoading(false);
    return result;
  };

  const getUserProfile = async (userId) => {
    try {
      return await userService.getUserProfile(userId);
    } catch (error) {
      console.error('Lỗi khi lấy hồ sơ người dùng:', error);
      return null;
    }
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getUserProfile,
    isAuthenticated: !!user
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 