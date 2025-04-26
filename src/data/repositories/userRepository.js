import { supabase } from '../../infrastructure/config/supabase';

export class UserRepository {
  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user || null;
    } catch (error) {
      throw error;
    }
  }

  // ... existing code ...
async login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Thêm dòng này để in access token ra console
    if (data && data.session && data.session.access_token) {
      console.log('Access Token:', data.session.access_token);
    }

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

  async register(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileData }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      callback(event, session);
    });

    return data;
  }
} 