import axiosClient from './axiosClient';

export const showApi = {
  getShowById: async (id) => {
    const res = await axiosClient.get(`/shows/${id}`);
    return res.data;
  },

  createShow: async (showData) => {
    const res = await axiosClient.post('/shows', showData);
    return res.data;
  },

  updateShow: async (id, showData) => {
    const res = await axiosClient.put(`/shows/${id}`, showData);
    return res.data;
  },

  deleteShow: async (id) => {
    const res = await axiosClient.delete(`/shows/${id}`);
    return res.data;
  },

  lockSeats: async (showId, seats) => {
    const res = await axiosClient.post(`/shows/${showId}/lock`, { seats });
    return res.data;
  },

  unlockSeats: async (showId, seats) => {
    const res = await axiosClient.post(`/shows/${showId}/unlock`, { seats });
    return res.data;
  },
};
