import axiosClient from './axiosClient';

export const authApi = {
  register: async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axiosClient.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await axiosClient.put('/users/me', data);
    return res.data;
  },
};
