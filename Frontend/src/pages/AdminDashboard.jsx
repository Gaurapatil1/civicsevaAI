import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import './AdminDashboard.css';
import { 
  FaTachometerAlt, FaClipboardList, FaUsers, FaCheckDouble, 
  FaSyncAlt, FaSignOutAlt, FaBell, FaMapMarkedAlt,
  FaExclamationTriangle, FaFilter, FaSearch
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', city: 'Mumbai' };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const stats = await getDashboardStats();
      if (stats) {
        setData(stats);
        setError(null);
      } else {
        setError("No data received from command center.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setError("Connection to operational database failed. Please check backend status.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return (
    <div className="admin-loading">
       <div className="spinner"></div>
       <p>Syncing Operational Command Center...</p>
    </div>
  );

  if (error || !data) return (
    <div className="admin-error-state">
       <FaExclamationTriangle className="error-icon" />
       <h2>Dashboard Sync Failed</h2>
       <p>{error || "Critical data components not found."}</p>
       <button onClick={fetchStats} className="btn-retry"><FaSyncAlt /> Retry Sync</button>
       <button onClick={() => navigate('/login')} className="btn-back">Return to Login</button>
    </div>
  );

  const { 
    analytics = {}, 
    recent_complaints = [], 
    workers = [], 
    verifications = [] 
  } = data;

  return (
    <div className="premium-admin-container">
      {/* Sidebar - Matching User's Screenshot Theme */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
           <img src="/civicseva_logo.png" alt="Logo" className="admin-sidebar-logo" />
           <div className="logo-text">
             <h3>Smart Municipal</h3>
             <p>ADMINISTRATION</p>
           </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active"><FaTachometerAlt /> Dashboard</div>
          <div className="nav-item"><FaClipboardList /> Grievance Registry</div>
          <div className="nav-item"><FaCheckDouble /> Work Verification</div>
          <div className="nav-item"><FaUsers /> Field Staff <span className="nav-badge">12</span></div>
          <div className="nav-item"><FaMapMarkedAlt /> Live Operations Map</div>
          <div className="nav-item logout" onClick={handleLogout}><FaSignOutAlt /> Logout</div>
        </nav>

        <div className="sidebar-footer">
           <div className="system-status">
              <div className="status-dot"></div>
              <span>System: Online</span>
           </div>
           <p className="last-sync">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        {/* Top bar */}
        <header className="admin-top-bar">
           <div className="header-left">
              <div className="hamburger">☰</div>
              <div className="header-logo-group">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="header-gov-logo" />
                 <div className="header-logo-sep"></div>
                 <h2>Operational Command Center</h2>
              </div>
           </div>
           <div className="header-right">
              <div className="search-box">
                 <FaSearch />
                 <input type="text" placeholder="Search ID or Worker..." />
              </div>
              <div className="icon-wrapper">
                 <FaBell />
                 <span className="bell-badge">5</span>
              </div>
              <div className="user-profile">
                 <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.city} Admin</span>
                 </div>
                 <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} alt="Profile" className="profile-img" />
              </div>
              <button onClick={handleLogout} className="top-bar-logout-btn">
                 <FaSignOutAlt /> Log out
              </button>
           </div>
        </header>

        {/* Hero Stats Row */}
        <section className="stats-grid">
           <div className="stat-card">
              <div className="stat-icon-bg blue-bg"><FaClipboardList /></div>
              <div className="stat-info">
                 <p>Total Grievances</p>
                 <h3>{analytics.total_complaints || 0}</h3>
                 <span className="sub-text blue">+{analytics.pending_complaints || 0} pending</span>
              </div>
           </div>
           <div className="stat-card">
              <div className="stat-icon-bg orange-bg"><FaExclamationTriangle /></div>
              <div className="stat-info">
                 <p>Pending Verification</p>
                 <h3>{analytics.pending_complaints || 0}</h3>
                 <span className="sub-text orange">High Priority</span>
              </div>
           </div>
           <div className="stat-card">
              <div className="stat-icon-bg green-bg"><FaCheckDouble /></div>
              <div className="stat-info">
                 <p>AI Verified Work</p>
                 <h3>{analytics.verification_verified || 0}</h3>
                 <span className="sub-text green">+12% this week</span>
              </div>
           </div>
           <div className="stat-card">
              <div className="stat-icon-bg purple-bg"><FaUsers /></div>
              <div className="stat-info">
                 <p>Field Staff Online</p>
                 <h3>{workers.length}</h3>
                 <span className="sub-text purple">Across all clusters</span>
              </div>
           </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-layout-grid">
           {/* Left Section: Grievance Logs */}
           <div className="logs-section">
              <div className="section-header">
                 <h3>Recent Grievance Logs</h3>
                 <div className="filter-options"><FaFilter /> Filter by Status</div>
              </div>

              <div className="logs-table-container">
                 <table className="premium-table">
                   <thead>
                     <tr>
                       <th>ID</th>
                       <th>Category</th>
                       <th>Citizen</th>
                       <th>Assigned Staff</th>
                       <th>Verification</th>
                       <th>Action</th>
                     </tr>
                   </thead>
                   <tbody>
                      {recent_complaints.map(c => {
                        const complaintId = String(c.id || c._id || 'N/A');
                        const v = verifications?.find(v => String(v.complaint_id) === complaintId);
                        return (
                          <tr key={complaintId}>
                             <td><span className="id-badge">#{ complaintId.substring(0, 6) }</span></td>
                             <td><strong>{c.category}</strong></td>
                             <td>{c.citizen_name}</td>
                             <td>{c.assigned_worker ? c.assigned_worker.name : 'Automating...'}</td>
                             <td>
                                <div className="verification-pills">
                                   <span className={`pill ${v?.gps_status === 'Location Verified' ? 'success' : 'gray'}`}>GPS</span>
                                   <span className={`pill ${v?.ai_result === 'Verified' ? 'success' : 'gray'}`}>AI</span>
                                </div>
                             </td>
                             <td><button className="view-btn">View Log</button></td>
                          </tr>
                        );
                      })}
                   </tbody>
                 </table>
              </div>
              <div className="view-more">View All Grievances →</div>
           </div>

           {/* Right Sidebar Section */}
           <div className="admin-side-panel">
              {/* Map/Location Section */}
              <div className="panel-card map-view">
                 <div className="panel-header">
                    <h3>Field Operations Map</h3>
                    <span className="live-text">● Live</span>
                 </div>
                 <div className="mini-map">
                    <img src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/73.8567,18.5204,12,0/400x250?access_token=pk.eyJ1IjoibW9ja3VzZXIiLCJhIjoiY2xwYmJidmR6MDBqazJrbnY5eGZqYmZ2NCJ9.mock_token" alt="Map" />
                    <div className="worker-dot one"></div>
                    <div className="worker-dot two"></div>
                    <div className="worker-dot three"></div>
                 </div>
                 <div className="map-footer">
                    12 Workers active in South Sector
                    <button className="btn-expand">Expand Map</button>
                 </div>
              </div>

              {/* Citizen Response Stats */}
              <div className="panel-card response-metrics">
                 <div className="panel-header">
                    <h3>Citizen Satisfaction</h3>
                    <div className="dropdown-small">Monthly ▾</div>
                 </div>
                 <div className="metric-row">
                    <div className="circle-progress">
                       <svg viewBox="0 0 36 36">
                          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="circle" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <text x="18" y="20.35" className="percentage">85%</text>
                       </svg>
                    </div>
                    <div className="metric-text">
                       <strong>Positive Feedback</strong>
                       <p>Based on {analytics.citizen_responses || 0} responses</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
