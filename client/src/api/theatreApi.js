import axiosClient from './axiosClient';

export const theatreApi = {
  getTheatres: async (params = {}) => {
    const res = await axiosClient.get('/theatres', { params });
    return res.data;
  },

  getTheatreById: async (id) => {
    const res = await axiosClient.get(`/theatres/${id}`);
    return res.data;
  },

  createTheatre: async (data) => {
    const res = await axiosClient.post('/theatres', data);
    return res.data;
  },

  updateTheatre: async (id, data) => {
    const res = await axiosClient.put(`/theatres/${id}`, data);
    return res.data;
  },

  deleteTheatre: async (id) => {
    const res = await axiosClient.delete(`/theatres/${id}`);
    return res.data;
  },

  createScreen: async (data) => {
    const res = await axiosClient.post('/screens', data);
    return res.data;
  },

  updateScreen: async (id, data) => {
    const res = await axiosClient.put(`/screens/${id}`, data);
    return res.data;
  },

  deleteScreen: async (id) => {
    const res = await axiosClient.delete(`/screens/${id}`);
    return res.data;
  },
};
