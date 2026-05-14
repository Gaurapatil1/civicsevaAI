import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';
import { FaUser, FaLock, FaCity, FaEnvelope, FaCheckCircle, FaSearch, FaPhone } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      let errorMsg = err.response?.data?.detail || 'Registration failed. Try again.';
      if (typeof errorMsg === 'object') {
        errorMsg = Array.isArray(errorMsg) ? errorMsg[0]?.msg : JSON.stringify(errorMsg);
      }
      setError(errorMsg);
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
            <h1 className="login-title">Citizen Registration</h1>
            <div className="underline-red"></div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleRegister} className="gov-form">
              <div className="gov-form-group">
                <label>FULL NAME <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>MOBILE NUMBER <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Enter 10 digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>EMAIL ADDRESS <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="e.g. rajesh@gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>CITY / DISTRICT <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaCity className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label>CREATE PASSWORD <span className="req">*</span></label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-gov-login" disabled={loading}>
                  {loading ? 'WAIT...' : 'COMPLETE REGISTRATION'}
                </button>
              </div>
            </form>
            
            <div className="auth-footer-links">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </div>

          <div className="login-info-side">
             <h2>Empowering Citizens via Digital Governance</h2>
             <p>Register once and access all municipal services through our Unified AI-Driven Citizen Bot.</p>
             
             <ul className="info-points">
                <li><FaCheckCircle className="check-icon" /> Digital Signature Verification</li>
                <li><FaCheckCircle className="check-icon" /> 24/7 AI Support Access</li>
                <li><FaCheckCircle className="check-icon" /> Automated Grievance Routing</li>
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

export default Register;
