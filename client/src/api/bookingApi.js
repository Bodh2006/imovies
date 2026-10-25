import axiosClient from './axiosClient';

export const bookingApi = {
  createBooking: async (data) => {
    const res = await axiosClient.post('/bookings', data);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await axiosClient.get('/bookings/my');
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await axiosClient.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await axiosClient.put(`/bookings/${id}/cancel`);
    return res.data;
  },
};
