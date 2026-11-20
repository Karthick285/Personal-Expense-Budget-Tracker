import api from './api';

export const authService = {
  async login(email, password, rememberMe = true) {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    return res.data;
  },

  async register(name, email, password, confirmPassword) {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword });
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  }
};
