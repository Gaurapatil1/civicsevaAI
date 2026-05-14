import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OTPVerification.css';
import { FaUserPlus, FaSignInAlt, FaFolderOpen, FaSearch, FaPhone } from 'react-icons/fa';

const OTPVerification = () => {
  console.log("OTPVerification Page Mounted");
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const mobileNo = "7823866639"; // Mock mobile from screenshot

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp === '123456') {
      navigate('/officer');
    } else {
      alert("Invalid OTP. For demo use: 123456");
    }
  };

  return (
    <div className="otp-page-wrapper">
      {/* Official State Header */}
      <header className="state-header">
        <div className="state-header-top">
          <div className="logos">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Emblem_of_India.svg" alt="India Emblem" className="emblem" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Seal_of_Maharashtra.svg" alt="MH Seal" className="mh-seal" />
            <div className="title-area">
              <h1>GRIEVANCE REDRESSAL PORTAL</h1>
              <p>Government of Maharashtra</p>
            </div>
            <img src="https://aaplesarkar.mahaonline.gov.in/Images/logo.png" alt="Aaple Sarkar" className="aaple-sarkar" />
          </div>
          
          <div className="top-nav-links">
            <div className="link-item"><FaUserPlus /> Citizen Registration</div>
            <div className="link-item"><FaSignInAlt /> Citizen Login</div>
            <div className="link-item active"><FaSignInAlt /> Officer Login</div>
            <div className="link-item"><FaSearch /> Track Grievance</div>
            <div className="link-item"><FaFolderOpen /> e-Office Tapaal Tracker</div>
          </div>
        </div>
        
        <nav className="state-main-nav">
          <div className="nav-item">HOMEPAGE</div>
          <div className="nav-item">ABOUT US</div>
          <div className="nav-item">DASHBOARD</div>
          <div className="nav-item">OFFICER AND CONTACT</div>
          <div className="nav-item">CALL CENTER</div>
          <div className="nav-item">FAQS</div>
        </nav>
      </header>

      {/* Breadcrumb Bar */}
      <div className="breadcrumb-bar">
        <div className="container">
           <span>🏠 Home &gt; Citizens &gt; <span className="active">OTP Verification</span></span>
        </div>
      </div>

      {/* Main Content */}
      <main className="otp-main">
         <p className="otp-alert-text">An OTP has been sent to your mobile number. It will expire after 2 minutes</p>
         <h2 className="otp-title">OTP Verification</h2>

         <div className="otp-card">
            <div className="form-row">
               <label>Mobile No.</label>
               <span>{mobileNo}</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group-vertical">
                 <label>Enter OTP Received <span className="req">*</span></label>
                 <input 
                   type="text" 
                   maxLength="6"
                   placeholder="Try 123456"
                   value={otp}
                   onChange={(e) => setOtp(e.target.value)}
                   required
                 />
              </div>
              <p className="demo-hint">Demo OTP: <strong>123456</strong></p>
              <button type="submit" className="btn-submit-otp">Submit</button>
            </form>
         </div>
      </main>

      <footer className="state-footer">
          © 2026 Government of Maharashtra. All Rights Reserved.
      </footer>
    </div>
  );
};

export default OTPVerification;
