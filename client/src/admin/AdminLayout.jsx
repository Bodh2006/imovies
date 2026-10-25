import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  Shield,
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="admin-layout py-4">
      <div className="container">
        {/* Admin Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <Shield size={24} color="var(--cinema-red)" />
            <h3 className="text-white fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>
              IMovies Admin Center
            </h3>
          </div>
          <span className="badge bg-danger px-3 py-2 fw-bold text-uppercase">
            Administrator Access
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap ${
                isActive ? 'btn-danger fw-bold' : 'btn-cinema-outline text-secondary'
              }`
            }
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/movies"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap ${
                isActive ? 'btn-danger fw-bold' : 'btn-cinema-outline text-secondary'
              }`
            }
          >
            <Film size={16} /> Movies Catalogue
          </NavLink>

          <NavLink
            to="/admin/theatres"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap ${
                isActive ? 'btn-danger fw-bold' : 'btn-cinema-outline text-secondary'
              }`
            }
          >
            <Building2 size={16} /> Theatres & Screens
          </NavLink>

          <NavLink
            to="/admin/shows"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap ${
                isActive ? 'btn-danger fw-bold' : 'btn-cinema-outline text-secondary'
              }`
            }
          >
            <CalendarDays size={16} /> Shows & Schedules
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap ${
                isActive ? 'btn-danger fw-bold' : 'btn-cinema-outline text-secondary'
              }`
            }
          >
            <Ticket size={16} /> All Bookings
          </NavLink>
        </div>

        {/* Child Admin Pages */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
