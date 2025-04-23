export class UserModel {
  constructor(userData) {
    // Auth data
    this.id = userData.id;
    this.email = userData.email;
    this.role = userData.role;
    this.created_at = userData.created_at;
    this.last_sign_in_at = userData.last_sign_in_at;
    this.confirmed_at = userData.confirmed_at;
    this.aud = userData.aud;
    
    // User metadata
    if (userData.user_metadata) {
      this.user_metadata = userData.user_metadata;
    } else if (userData.raw_user_meta_data) {
      this.user_metadata = userData.raw_user_meta_data;
    } else {
      this.user_metadata = {};
    }
    
    // App metadata
    if (userData.app_metadata) {
      this.app_metadata = userData.app_metadata;
    } else if (userData.raw_app_meta_data) {
      this.app_metadata = userData.raw_app_meta_data;
    } else {
      this.app_metadata = {};
    }
    
    // Các trường thêm từ profile sẽ được gán khi gọi phương thức setProfile
    this.profile = null;
  }
  
  setProfile(profileData) {
    if (profileData) {
      this.profile = {
        role: profileData.role,
        full_name: profileData.full_name,
        phone_number: profileData.phone_number,
        address: profileData.address,
        avatar_url: profileData.avatar_url,
        email: profileData.email,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };
    }
    return this;
  }

  getFullName() {
    // Ưu tiên lấy từ profile nếu có
    if (this.profile && this.profile.full_name) {
      return this.profile.full_name;
    }
    // Không thì lấy từ user_metadata
    return this.user_metadata.full_name || '';
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      last_sign_in_at: this.last_sign_in_at,
      confirmed_at: this.confirmed_at,
      aud: this.aud,
      user_metadata: this.user_metadata,
      app_metadata: this.app_metadata,
      profile: this.profile,
      full_name: this.getFullName()
    };
  }
} 