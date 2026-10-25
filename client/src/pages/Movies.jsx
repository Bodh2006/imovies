import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import MovieCard from '../components/MovieCard';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const queryQ = searchParams.get('q') || '';
  const queryGenre = searchParams.get('genre') || '';
  const queryLanguage = searchParams.get('language') || '';
  const queryStatus = searchParams.get('status') || '';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState(queryQ);

  useEffect(() => {
    setSearch(queryQ);
  }, [queryQ]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {
          page: queryPage,
          limit: 12,
        };
        if (queryQ) params.q = queryQ;
        if (queryGenre) params.genre = queryGenre;
        if (queryLanguage) params.language = queryLanguage;
        if (queryStatus) params.status = queryStatus;

        const res = await movieApi.getMovies(params);
        if (res.success) {
          setMovies(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [queryQ, queryGenre, queryLanguage, queryStatus, queryPage]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', search.trim());
  };

  const handleResetFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const setPage = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const genres = ['Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Thriller', 'Biography', 'Comedy'];
  const languages = ['English', 'Hindi', 'Spanish'];

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold m-0">Movie Directory</h2>
          <p className="text-secondary small mb-0">
            Browse currently screening blockbusters and upcoming theatrical releases.
          </p>
        </div>

        {/* Status Tab Pills */}
        <div className="btn-group p-1 bg-dark rounded-pill border border-secondary border-opacity-25">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${!queryStatus ? 'btn-danger fw-bold' : 'text-secondary'}`}
            onClick={() => updateParam('status', '')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${queryStatus === 'now_showing' ? 'btn-danger fw-bold' : 'text-secondary'}`}
            onClick={() => updateParam('status', 'now_showing')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${queryStatus === 'coming_soon' ? 'btn-danger fw-bold' : 'text-secondary'}`}
            onClick={() => updateParam('status', 'coming_soon')}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 mb-4">
        <div className="row g-3">
          {/* Search box */}
          <div className="col-lg-4 col-md-6">
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <Search
                size={18}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
              />
              <input
                type="text"
                className="form-control form-control-cinema ps-5"
                placeholder="Search by title, cast..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>

          {/* Genre select */}
          <div className="col-lg-3 col-md-3 col-6">
            <select
              className="form-select form-select-cinema"
              value={queryGenre}
              onChange={(e) => updateParam('genre', e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language select */}
          <div className="col-lg-3 col-md-3 col-6">
            <select
              className="form-select form-select-cinema"
              value={queryLanguage}
              onChange={(e) => updateParam('language', e.target.value)}
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="col-lg-2 col-md-12 d-flex">
            <button
              type="button"
              className="btn btn-cinema-outline w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleResetFilters}
            >
              <RefreshCw size={15} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <span className="text-secondary small">
          Showing <span className="text-white fw-bold">{movies.length}</span> of {total} titles
        </span>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel p-5 text-center text-secondary">
          <h5>No movies found</h5>
          <p className="small mb-3">Try clearing filters or searching for another keyword.</p>
          <button className="btn btn-cinema-outline" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <button
                className="btn btn-cinema-outline btn-sm px-3"
                disabled={queryPage <= 1}
                onClick={() => setPage(queryPage - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span className="text-secondary small px-3">
                Page <span className="text-white fw-bold">{queryPage}</span> of {totalPages}
              </span>

              <button
                className="btn btn-cinema-outline btn-sm px-3"
                disabled={queryPage >= totalPages}
                onClick={() => setPage(queryPage + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;
