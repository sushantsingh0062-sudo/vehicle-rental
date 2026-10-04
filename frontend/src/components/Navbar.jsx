import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🚗 Vehicle Rental System
      </Link>

      <div className="navbar-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Vehicles
        </Link>

        {isAuthenticated ? (
          <>
            {!isAdmin && (
              <Link 
                to="/my-bookings" 
                className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}
              >
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link 
                to="/admin/fleet" 
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              >
                Admin Dashboard
              </Link>
            )}

            <div className="user-tag">
              <strong>{user?.name}</strong>
              <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-info'}`}>
                {isAdmin ? 'Admin' : 'Customer'}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
