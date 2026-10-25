import axiosClient from './axiosClient';

export const adminApi = {
  getBookings: async (params = {}) => {
    const res = await axiosClient.get('/admin/bookings', { params });
    return res.data;
  },

  getStats: async () => {
    const res = await axiosClient.get('/admin/stats');
    return res.data;
  },
};
