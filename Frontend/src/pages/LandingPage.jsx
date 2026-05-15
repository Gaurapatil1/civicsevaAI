import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiX, FiCheckCircle, FiShield, FiTrendingUp, FiActivity, FiMapPin, FiStar } from 'react-icons/fi';
import CitizenBot from './CitizenBot';
import api from '../services/api';
import './LandingPage.css';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px', color: '#F59E0B' }}>
    {[1,2,3,4,5].map(s => (
      <FiStar key={s} fill={s <= rating ? '#F59E0B' : 'none'} size={16} />
    ))}
  </div>
);

const LandingPage = () => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real citizen reviews from resolved complaints
    api.get('/complaints/reviews').then(res => {
      setReviews(res.data || []);
    }).catch(() => {});
  }, []);

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
          <button className="nav-btn worker-btn" onClick={() => navigate('/worker-login')}>Worker Dashboard</button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" style={{ backgroundImage: `url('/image-1.png')` }}></div>
        <div className="hero-content">
          <h1 className="hero-title">Smart Grievance & Municipal Task Allocation Platform</h1>
          <p className="hero-subtitle">Improving complaint resolution efficiency using intelligent prioritization and workforce optimization.</p>
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
            <h3>Automated Priority Assessment</h3>
            <p>Automatically categorizes and assigns priority based on urgency using advanced analytical models.</p>
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

      {/* Citizen Reviews Section */}
      {reviews.length > 0 && (
        <section style={{ background: '#f8fafc', padding: '60px 40px', borderTop: '1px solid #e2e8f0' }}>
          <h2 style={{ textAlign: 'center', color: '#1a4f9c', fontWeight: 800, marginBottom: '8px' }}>Citizen Reviews</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Real feedback from citizens who used CivicSevaAI</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                <StarRating rating={r.rating} />
                <p style={{ color: '#374151', margin: '12px 0', lineHeight: '1.6', fontStyle: 'italic' }}>"{r.feedback || r.category + ' issue resolved promptly!'}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ color: '#1e293b', fontSize: '0.9rem' }}>{r.citizen_name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{r.category}</span>
                  </div>
                  {r.completion_image && r.completion_image !== 'repair_site.jpg' && (
                    <img
                      src={r.completion_image}
                      alt="Proof"
                      onClick={() => window.open(r.completion_image, '_blank')}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid #1a4f9c' }}
                      title="Click to view proof image"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
