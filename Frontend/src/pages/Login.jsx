import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Auth.css';
import { FaUser, FaLock, FaCheckCircle, FaSearch } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (captcha.toUpperCase() !== '6FGMN') {
      setError('Invalid CAPTCHA code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Navigate to OTP verification for security
      navigate('/otp-verification');
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
        <div className="nav-container">
          <div className="nav-links">
            <Link to="/"><div className="nav-item active">HOME</div></Link>
            <div className="nav-item">ABOUT US</div>
            <Link to="/admin"><div className="nav-item">DASHBOARD</div></Link>
            <div className="nav-item">CONTACT</div>
            <div className="nav-item">HELP</div>
          </div>
          <div className="nav-search">
             <FaSearch /> <input type="text" placeholder="Search Services..." />
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="login-card-container fade-in">
          <div className="login-form-side">
            <h1 className="login-title">Admin Login</h1>
            <div className="underline-red"></div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleLogin} className="gov-form">
              <div className="gov-form-group">
                <label>USERNAME / EMAIL / MOBILE NO <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter your identifier"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>PASSWORD <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>CAPTCHA <span className="req">*</span></label>
                <div className="captcha-container">
                  <input 
                    type="text" 
                    placeholder="Enter code"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    required 
                  />
                  <div className="captcha-display">
                    6FGMN
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-gov-login" disabled={loading}>
                  {loading ? 'WAIT...' : 'LOGIN'}
                </button>
                <button type="button" className="btn-gov-forgot">Forgot Password?</button>
              </div>
            </form>
            
            <div className="auth-footer-links">
              New user? <Link to="/register">Register here</Link>
            </div>
          </div>

          <div className="login-info-side">
             <h2>Operational Command & Management Console</h2>
             <p>Access the unified dashboard to monitor city-wide grievances, manage field staff, and ensure rapid resolution of civic issues using AI-driven allocation.</p>
             
             <ul className="info-points">
                <li><FaCheckCircle className="check-icon" /> Real-time Grievance Monitoring</li>
                <li><FaCheckCircle className="check-icon" /> Field Staff Load Management</li>
                <li><FaCheckCircle className="check-icon" /> AI-Augmented Decision Support</li>
             </ul>
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
