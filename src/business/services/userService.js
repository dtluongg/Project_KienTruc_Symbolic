import { UserModel } from '../models/UserModel';

export class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async getCurrentUser() {
    try {
      const user = await this.repository.getCurrentUser();
      if (!user) return null;
      
      const userModel = new UserModel(user);
      
      // Lấy thông tin profile và gán vào user
      try {
        const profile = await this.repository.getUserProfile(user.id);
        if (profile) {
          userModel.setProfile(profile);
        }
      } catch (profileError) {
        console.error('Lỗi khi lấy thông tin profile:', profileError.message);
      }
      
      return userModel;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin người dùng hiện tại: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const result = await this.repository.login(email, password);
      if (result.error) throw result.error;
      
      let userModel = null;
      if (result.data && result.data.user) {
        userModel = new UserModel(result.data.user);
        
        // Lấy thông tin profile và gán vào user
        try {
          const profile = await this.repository.getUserProfile(result.data.user.id);
          if (profile) {
            userModel.setProfile(profile);
          }
        } catch (profileError) {
          console.error('Lỗi khi lấy thông tin profile:', profileError.message);
        }
      }
      
      return { success: true, user: userModel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(email, password, metadata = {}) {
    try {
      const result = await this.repository.register(email, password, metadata);
      if (result.error) throw result.error;
      
      let userModel = null;
      if (result.data && result.data.user) {
        userModel = new UserModel(result.data.user);
        
        // Tạo profile cho người dùng mới
        try {
          if (metadata) {
            const newProfile = {
              id: result.data.user.id,
              full_name: metadata.full_name,
              email: email,
              role: 'customer'
            };
            
            const profile = await this.repository.updateUserProfile(result.data.user.id, newProfile);
            if (profile) {
              userModel.setProfile(profile);
            }
          }
        } catch (profileError) {
          console.error('Lỗi khi tạo profile:', profileError.message);
        }
      }
      
      return { success: true, user: userModel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const result = await this.repository.logout();
      if (result.error) throw result.error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await this.repository.getUserProfile(userId);
      return profile;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin hồ sơ người dùng: ${error.message}`);
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const updatedProfile = await this.repository.updateUserProfile(userId, profileData);
      return updatedProfile;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật hồ sơ người dùng: ${error.message}`);
    }
  }
} 