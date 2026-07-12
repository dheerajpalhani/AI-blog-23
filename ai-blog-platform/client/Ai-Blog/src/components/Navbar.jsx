import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo-link">
          <span className="logo-text">AI BlogForge</span>
        </Link>
        
        <nav className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Home
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/create" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Create Blog
              </NavLink>
              <span className="nav-link" style={{ color: 'var(--text-muted)' }}>
                Hi, {user?.name || 'User'}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Login
              </NavLink>
              <Link to="/register" className="nav-btn">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
