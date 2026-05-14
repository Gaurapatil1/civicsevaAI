import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiX, FiCheckCircle, FiShield, FiTrendingUp, FiActivity, FiMapPin } from 'react-icons/fi';
import CitizenBot from './CitizenBot';
import './LandingPage.css';

const LandingPage = () => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const navigate = useNavigate();

  const handleReportClick = () => {
    setIsBotOpen(true);
  };

  return (
    <div className="landing-page">
      {/* 1. Top Navigation Bar */}
      <nav className="landing-navbar">
        <div className="navbar-left">
          <img src="/image-2.png" alt="Gov Emblem" className="gov-emblem" style={{ height: '50px', width: 'auto'}} />
          <div className="navbar-title">
            <span className="gov-text">Government of India</span>
            <span className="portal-text">Municipal Smart Governance Portal</span>
          </div>
        </div>
        <div className="navbar-right">
          <button className="nav-link" onClick={() => window.scrollTo(0, 0)}>Home</button>
          <button className="nav-link" onClick={() => document.getElementById('about').scrollIntoView()}>About System</button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/login')}>Admin Login</button>
          <button className="nav-btn worker-btn" onClick={() => navigate('/login')}>Worker Dashboard</button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">AI-Powered Smart Grievance & Municipal Task Allocation Platform</h1>
          <p className="hero-subtitle">Improving complaint resolution efficiency using AI-driven prioritization and workforce optimization.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleReportClick}>Report Complaint</button>
            <button className="btn-secondary" onClick={() => navigate('/admin')}>View Dashboard</button>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="about" className="features-section">
        <h2 className="section-title">Operational Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiActivity /></div>
            <h3>AI Complaint Prioritization</h3>
            <p>Automatically categorizes and assigns priority based on urgency using advanced machine learning models.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiMapPin /></div>
            <h3>Smart Worker Allocation</h3>
            <p>Optimizes resource deployment by assigning the nearest and most qualified municipal worker to the task.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiTrendingUp /></div>
            <h3>Real-Time Monitoring</h3>
            <p>Provides a live administrative dashboard for authorities to track progress and operational metrics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>Complaint Tracking</h3>
            <p>Citizens can track their complaint status from submission to resolution transparently.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiCheckCircle /></div>
            <h3>Citizen Feedback System</h3>
            <p>Closing the loop by collecting user ratings and feedback to ensure high service quality.</p>
          </div>
        </div>
      </section>

      {/* 5. System Workflow Section */}
      <section className="workflow-section">
        <h2 className="section-title">System Workflow</h2>
        <div className="workflow-timeline">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h4>Citizen Complaint</h4>
            <p>Issue reported via bot</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h4>AI Prediction</h4>
            <p>Category & priority assigned</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h4>Worker Allocation</h4>
            <p>Smart assignment to field agent</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <h4>Task Completion</h4>
            <p>Resolution with image proof</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">5</div>
            <h4>Citizen Feedback</h4>
            <p>Verification & rating</p>
          </div>
        </div>
      </section>

      {/* 6. Analytics Preview Section */}
      <section className="analytics-section">
        <h2 className="section-title">Operational Visibility</h2>
        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-value">1,245</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">180</div>
            <div className="stat-label">Active Workers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Critical Issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">1,150</div>
            <div className="stat-label">Resolved Complaints</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <img src="/image-3.png" alt="System Interface Preview" style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
        </div>
      </section>

      {/* 7. Footer Section */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>CivicSevaAI</h3>
            <p>A smart governance municipal platform with AI-powered civic operations.</p>
          </div>
          <div className="footer-links">
            <p>&copy; 2026 Government of India & CivicSevaAI Team. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 3. Floating Complaint Bot */}
      <div className="floating-bot-container">
        {!isBotOpen ? (
          <button className="floating-bot-btn shadow-lg" onClick={() => setIsBotOpen(true)}>
            <FiMessageSquare size={28} />
          </button>
        ) : (
          <div className="floating-bot-window shadow-xl">
            <div className="bot-window-header">
              <span>Municipal AssistantBot</span>
              <button onClick={() => setIsBotOpen(false)} className="close-bot-btn"><FiX size={20}/></button>
            </div>
            <div className="bot-window-content">
              <CitizenBot />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
