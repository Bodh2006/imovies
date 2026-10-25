import axiosClient from './axiosClient';

export const movieApi = {
  getMovies: async (params = {}) => {
    const res = await axiosClient.get('/movies', { params });
    return res.data;
  },

  getMovieById: async (id) => {
    const res = await axiosClient.get(`/movies/${id}`);
    return res.data;
  },

  getMovieShows: async (id, params = {}) => {
    const res = await axiosClient.get(`/movies/${id}/shows`, { params });
    return res.data;
  },

  createMovie: async (movieData) => {
    const res = await axiosClient.post('/movies', movieData);
    return res.data;
  },

  updateMovie: async (id, movieData) => {
    const res = await axiosClient.put(`/movies/${id}`, movieData);
    return res.data;
  },

  deleteMovie: async (id) => {
    const res = await axiosClient.delete(`/movies/${id}`);
    return res.data;
  },
};
