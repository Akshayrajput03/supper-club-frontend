import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Menu, X, User, LogOut, PlusCircle, Calendar } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <ChefHat size={22} />
          <span>SupperClub</span>
        </Link>

        <div className="navbar-links">
          <Link to="/listings" className={`navbar-link ${location.pathname === '/listings' ? 'active' : ''}`}>
            Browse Dinners
          </Link>
          {user && (
            <Link to="/host/create" className="btn btn-outline" style={{ padding: '7px 16px', fontSize: 13 }}>
              <PlusCircle size={15} /> Host a Dinner
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar-avatar">{user.fullName?.[0]?.toUpperCase() || 'U'}</div>
              <span className="navbar-name">{user.fullName?.split(' ')[0]}</span>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Calendar size={15} /> My Bookings
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={15} /> Profile
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Join</Link>
            </div>
          )}

          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile">
          <Link to="/listings" onClick={() => setMenuOpen(false)}>Browse Dinners</Link>
          {user ? (
            <>
              <Link to="/host/create" onClick={() => setMenuOpen(false)}>Host a Dinner</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Bookings</Link>
              <button onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Join</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
