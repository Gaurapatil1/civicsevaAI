import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Auth.css';
import { FaUser, FaLock, FaCheckCircle, FaSearch, FaSignOutAlt } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Navigate based on PRD roles
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Access denied. Please use the Field Operative Portal for worker login.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-auth-wrapper">
      {/* Top Navbar */}
      <nav className="gov-navbar">
        <div className="nav-container header-logos">
          <div className="logo-group">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="gov-logo-img" />
            <div className="logo-separator"></div>
            <img src="/civicseva_logo.png" alt="CivicSeva" className="project-logo-img" />
            <div className="logo-text-desktop">
               <span className="gov-title">Government of India</span>
               <span className="project-title">CivicSevaAI Portal</span>
            </div>
          </div>
          
          <div className="nav-actions">
            <button onClick={() => navigate('/')} className="nav-portal-btn">
              CITIZEN PORTAL
            </button>
            {localStorage.getItem('user') && (
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="nav-logout-btn">
                <FaSignOutAlt /> LOGOUT
              </button>
            )}
            <div className="nav-search-minimal">
               <FaSearch />
            </div>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="login-card-container fade-in">
          <div className="login-form-side">
            <h1 className="login-title">WELCOME</h1>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleLogin} className="gov-form">
              <div className="gov-form-group">
                <label>Email Address</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="gov-form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="form-options">
                <label>
                  <input type="checkbox" /> Remember
                </label>
                <a href="#" className="forgot-link">Forgot Password ?</a>
              </div>

              <button type="submit" className="btn-gov-login" disabled={loading}>
                {loading ? 'WAIT...' : 'SUBMIT'}
              </button>
            </form>
            
            <div className="auth-footer-links">
              New user? <Link to="/register">Register here</Link>
            </div>
          </div>

          <div className="login-info-side">
             <img src="/admin.png" alt="Admin Vector Illustration" />
          </div>
        </div>
      </div>

      <footer className="gov-footer-bar">
         © 2026 National Informatics Centre (NIC) | Digital India Initiative
      </footer>
    </div>
  );
};

export default Login;
