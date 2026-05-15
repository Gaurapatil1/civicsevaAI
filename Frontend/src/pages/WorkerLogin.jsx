import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Auth.css';
import { FaUser, FaLock, FaCheckCircle, FaSearch, FaSignOutAlt, FaHardHat } from 'react-icons/fa';

const WorkerLogin = () => {
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
      // Extra check: only let workers log in here
      if (data.user.role !== 'worker' && data.user.role !== 'admin') {
         setError('Access denied. Field Operative authorization required.');
         setLoading(false);
         return;
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      navigate('/worker-dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-auth-wrapper worker-login-theme">
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
            <div className="nav-search-minimal">
               <FaSearch />
            </div>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="login-card-container fade-in" style={{ borderColor: '#10b981' }}>
          <div className="login-form-side">
            <h1 className="login-title" style={{ color: '#047857' }}><FaHardHat style={{marginRight: '10px'}}/>Field Operative Login</h1>
            <div className="underline-red" style={{ backgroundColor: '#10b981' }}></div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleLogin} className="gov-form">
              <div className="gov-form-group">
                <label>WORKER ID / EMAIL <span className="req">*</span></label>
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
                  <div className="captcha-display" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}>
                    6FGMN
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-gov-login" disabled={loading} style={{ backgroundColor: '#059669' }}>
                  {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
                </button>
              </div>
            </form>
          </div>

          <div className="login-info-side" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}>
             <h2>On-Ground Operations Portal</h2>
             <p>Access your allocated tasks, verify resolutions securely via AI, and ensure faster grievance remediation on the field.</p>
             
             <ul className="info-points">
                <li><FaCheckCircle className="check-icon" style={{color: '#34d399'}}/> View AI-Assigned Tasks</li>
                <li><FaCheckCircle className="check-icon" style={{color: '#34d399'}}/> Upload GPS-Tagged Evidences</li>
                <li><FaCheckCircle className="check-icon" style={{color: '#34d399'}}/> Close Grievances on Site</li>
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

export default WorkerLogin;
