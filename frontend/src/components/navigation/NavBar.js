import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

/**
 * Standardized Navigation Bar component for FinTrackk
 * 
 * This component provides consistent navigation across all pages
 * based on the design from the settings page.
 */
const NavBar = ({ currentUser }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active link based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setActiveLink('dashboard');
    } else if (path.includes('/transactions')) {
      setActiveLink('transactions');
    } else if (path.includes('/budgets')) {
      setActiveLink('budgets');
    } else if (path.includes('/savings')) {
      setActiveLink('savings');
    } else if (path.includes('/insights')) {
      setActiveLink('insights');
    } else if (path.includes('/settings')) {
      setActiveLink('settings');
    }
  }, [location]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard">
            <h1>FinTrackk</h1>
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Main navigation menu */}
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links">
            <li className={activeLink === 'dashboard' ? 'active' : ''}>
              <Link to="/dashboard">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={activeLink === 'transactions' ? 'active' : ''}>
              <Link to="/transactions">
                <i className="fas fa-exchange-alt"></i>
                <span>Transactions</span>
              </Link>
            </li>
            <li className={activeLink === 'budgets' ? 'active' : ''}>
              <Link to="/budgets">
                <i className="fas fa-wallet"></i>
                <span>Budgets</span>
              </Link>
            </li>
            <li className={activeLink === 'savings' ? 'active' : ''}>
              <Link to="/savings">
                <i className="fas fa-piggy-bank"></i>
                <span>Savings Goals</span>
              </Link>
            </li>
            <li className={activeLink === 'insights' ? 'active' : ''}>
              <Link to="/insights">
                <i className="fas fa-lightbulb"></i>
                <span>Insights</span>
              </Link>
            </li>
            <li className={activeLink === 'settings' ? 'active' : ''}>
              <Link to="/settings">
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* User profile section */}
        <div className="navbar-user">
          {currentUser ? (
            <div className="user-profile">
              <div className="user-avatar">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={`${currentUser.name}'s avatar`} />
                ) : (
                  <span>{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <div className="user-dropdown">
                <span className="user-name">{currentUser.name}</span>
                <div className="dropdown-content">
                  <Link to="/settings/profile">Profile</Link>
                  <Link to="/settings/account">Account</Link>
                  <button className="logout-button">Log Out</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Log In</Link>
              <Link to="/register" className="register-button">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;