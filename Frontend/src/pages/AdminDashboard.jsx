import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import './AdminDashboard.css';
import { 
  FaChartLine, FaClipboardList, FaUsers, FaExclamationTriangle,
  FaCheckCircle, FaSignOutAlt, FaTools, FaFilter, FaSync
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', city: 'Mumbai' };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await getDashboardStats();
      setData(stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading && !data) return (
    <div className="gov-loading-overlay">
       <div className="gov-spinner"></div>
       <p>Initializing Central Command Station...</p>
    </div>
  );

  const { analytics, recent_complaints, workers, verifications, feedbacks } = data;

  return (
    <div className="gov-dashboard-container">
      {/* Sidebar */}
      <aside className="gov-sidebar">
        <div className="gov-sidebar-brand">
          <div className="seal-container">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Emblem_of_India.svg" alt="Seal" />
          </div>
          <div className="brand-text">
             <h2>Nagarpalika</h2>
             <p>ADMIN PORTAL</p>
          </div>
        </div>
        
        <nav className="gov-sidebar-nav">
          <div className="nav-group-title">MAIN MENU</div>
          <div className="gov-nav-item active"><FaChartLine /> Operational Stats</div>
          <div className="gov-nav-item"><FaClipboardList /> All Complaints</div>
          <div className="gov-nav-item"><FaCheckCircle /> Work Verification</div>
          <div className="gov-nav-item"><FaUsers /> Field Staff</div>
          <div className="gov-nav-item"><FaTools /> Equipment Logs</div>
          
          <div className="nav-group-title mt-4">ACCOUNT</div>
          <button onClick={handleLogout} className="gov-nav-item logout"><FaSignOutAlt /> Terminate Session</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="gov-main-area">
        <header className="gov-top-header">
           <div className="breadcrumb">Dashboard / Overview / <span className="current">Analytics</span></div>
           <div className="top-actions">
              <button className="btn-icon" onClick={fetchStats}><FaSync /> Sync</button>
              <div className="header-status-badge">SYSTEM STATUS: OPTIMAL</div>
           </div>
        </header>

        <section className="gov-hero-stats">
           <div className="hero-stat-card">
              <span className="label">TOTAL REGISTERED</span>
              <h2 className="count">{analytics.total_complaints}</h2>
              <div className="bar total"></div>
           </div>
           <div className="hero-stat-card">
              <span className="label">PENDING RESOLUTION</span>
              <h2 className="count yellow">{analytics.pending_complaints}</h2>
              <div className="bar pending"></div>
           </div>
           <div className="hero-stat-card">
              <span className="label">AI VERIFIED PROOF</span>
              <h2 className="count green">{analytics.verification_verified}</h2>
              <div className="bar resolved"></div>
           </div>
           <div className="hero-stat-card">
              <span className="label">CITIZEN FEEDBACK</span>
              <h2 className="count blue">{analytics.citizen_responses}</h2>
              <div className="bar total"></div>
           </div>
        </section>

        <div className="gov-data-grid">
          {/* Complaint Table */}
          <div className="gov-card col-span-2">
            <div className="gov-card-header">
               <h3><FaClipboardList /> Recent Grievance Logs</h3>
               <div className="card-filters"><FaFilter /> Filter list</div>
            </div>
            <div className="gov-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Grievance ID</th>
                    <th>Citizen Details</th>
                    <th>Category</th>
                    <th>Staff Assigned</th>
                    <th>Verification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_complaints.map(c => {
                    const verification = verifications?.find(v => v.complaint_id === (c.id || c._id));
                    const feedback = feedbacks?.find(f => f.complaint_id === (c.id || c._id));
                    
                    return (
                      <tr key={c.id || c._id}>
                        <td className="id-cell">#ID-{ (c.id || c._id).substring(0, 8) }</td>
                        <td>
                          <div className="citizen-info">
                             <strong>{c.citizen_name}</strong>
                             <span>{c.city}</span>
                          </div>
                        </td>
                        <td><span className="tag-category">{c.category}</span></td>
                        <td>{c.assigned_worker ? c.assigned_worker.name : 'Unassigned'}</td>
                        <td>
                           <div className="verification-tags">
                              <span className={`mini-tag ${verification?.gps_status === 'Location Verified' ? 'green' : 'gray'}`}>GPS</span>
                              <span className={`mini-tag ${verification?.ai_result === 'Verified' ? 'green' : 'gray'}`}>AI</span>
                              <span className={`mini-tag ${feedback?.citizen_response ? 'blue' : 'gray'}`}>CITIZEN</span>
                           </div>
                        </td>
                        <td><span className={`status-pill ${c.status.toLowerCase()}`}>{c.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worker Task Tracker */}
          <div className="gov-card">
            <div className="gov-card-header">
               <h3><FaUsers /> Field Staff Task Load</h3>
            </div>
            <div className="gov-staff-list">
               {workers.map((w, i) => (
                 <div key={i} className="staff-row">
                    <div className="staff-meta">
                       <strong>{w.name}</strong>
                       <span>{w.dept} Section</span>
                    </div>
                    <div className="staff-metrics">
                       <div className="metric-box">
                          <span className="val">{w.tasks}</span>
                          <span className="lbl">Tasks</span>
                       </div>
                       <div className="status-indicator">
                          <span className={`indicator-pill ${w.status === 'Available' ? 'online' : 'busy'}`}>{w.status}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
