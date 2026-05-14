import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getDashboardStats } from '../services/api';
import { 
  FiLayout, FiFileText, FiUsers, FiSettings, FiLogOut, 
  FiSearch, FiBell, FiBarChart2, FiCheckCircle, FiClock, FiAlertCircle 
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to sync with municipal database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1-minute refresh for stability
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const [showResolveModal, setShowResolveModal] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  const handleResolve = async (complaintId) => {
    try {
      await api.put(`/complaints/${complaintId}/resolve`, {
        completion_note: resolveNote,
        completion_image: "repair_site.jpg"
      });
      setResolveNote('');
      setShowResolveModal(null);
      fetchData();
    } catch (err) {
      alert("Failed to resolve complaint.");
    }
  };

  if (loading && !stats) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading Municipal Dashboard...</p>
      </div>
    );
  }

  const analytics = stats?.analytics || {
    total_complaints: 0,
    pending_complaints: 0,
    resolved_complaints: 0,
    critical_complaints: 0,
    total_workers: 0
  };

  const recentComplaints = stats?.recent_complaints || [];
  const workers = stats?.workers || [];

  return (
    <div className="premium-admin-container">
      {/* Sidebar - Official Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/civicseva_logo.png" alt="Gov Logo" className="admin-sidebar-logo" />
          <div className="logo-text">
            <h3>CivicSeva AI</h3>
            <p>Administration Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
            <FiLayout /> <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'Complaints' ? 'active' : ''}`} onClick={() => setActiveTab('Complaints')}>
            <FiFileText /> <span>Complaints</span>
            <span className="nav-badge">{analytics.pending_complaints}</span>
          </div>
          <div className={`nav-item ${activeTab === 'Workers' ? 'active' : ''}`} onClick={() => setActiveTab('Workers')}>
            <FiUsers /> <span>Field Workers</span>
          </div>
          <div className={`nav-item ${activeTab === 'Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('Analytics')}>
            <FiBarChart2 /> <span>Operations Intel</span>
          </div>
          
          <div className="nav-item logout-nav" onClick={handleLogout} style={{marginTop: 'auto'}}>
            <FiLogOut /> <span>Log Out</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot"></div>
            <span>System: Operational</span>
          </div>
        </div>
      </aside>

      {/* Main Operational Area */}
      <main className="admin-main-content">
        <header className="admin-top-bar">
          <div className="header-logo-group">
            <img src="/pngwing.com (1).png" alt="Emblem" className="header-gov-logo" />
            <div className="header-logo-sep"></div>
            <h2>MUNICIPAL OPERATIONS DASHBOARD</h2>
          </div>

          <div className="top-bar-actions">
            <div className="search-box">
              <FiSearch />
              <input type="text" placeholder="Search records..." />
            </div>
            <FiBell style={{color: '#64748b', cursor: 'pointer'}} />
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 700, fontSize: '0.85rem'}}>Administrator</div>
                <div style={{fontSize: '0.7rem', color: '#64748b'}}>{user?.city || 'Municipal'} Branch</div>
              </div>
              <img src="https://ui-avatars.com/api/?name=Admin&background=003366&color=fff" style={{width: '32px', height: '32px', borderRadius: '4px'}} />
            </div>
          </div>
        </header>

        {/* Dashboard KPIs */}
        <section className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#dcfce7', color: '#166534'}}><FiCheckCircle /></div>
            <div className="stat-info">
              <span className="stat-label">Citizen Satisfaction</span>
              <h2 className="stat-value">{analytics.citizen_satisfaction || '4.2'} / 5.0</h2>
              <span className="stat-trend trend-up">Avg of {analytics.total_complaints || 0} Ratings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#fef3c7', color: '#92400e'}}><FiClock /></div>
            <div className="stat-info">
              <span className="stat-label">Avg. Resolution Time</span>
              <h2 className="stat-value">18.4 Hrs</h2>
              <span className="stat-trend trend-down">-2.1h from last week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#fee2e2', color: '#991b1b'}}><FiAlertCircle /></div>
            <div className="stat-info">
              <span className="stat-label">Active Issues</span>
              <h2 className="stat-value">{analytics.pending_complaints || 0}</h2>
              <span className="stat-trend trend-up">Attention Required</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: '#e0f2fe', color: '#075985'}}><FiUsers /></div>
            <div className="stat-info">
              <span className="stat-label">Field Staff Active</span>
              <h2 className="stat-value">{workers.filter(w => w.status === 'Available').length || 0}</h2>
              <span className="stat-trend trend-up">On Standby</span>
            </div>
          </div>
        </section>

        {/* Main Operational Feed */}
        <div className="dashboard-layout-grid fade-in" style={{animationDelay: '0.1s'}}>
          {/* Complaints Table */}
          <section className="logs-section">
            <div className="section-header">
              <h3>Recent Complaints</h3>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}><FiClock /> Updated Live</div>
            </div>

            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.slice(0, 10).map((c, idx) => (
                  <tr key={idx}>
                    <td><span className="id-badge">#{c._id?.slice(-5).toUpperCase()}</span></td>
                    <td><strong>{c.category}</strong></td>
                    <td style={{color: c.priority === 'Critical' ? '#ef4444' : '#1e293b'}}>
                      {c.priority}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                                        <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button style={{color: '#0056b3', fontWeight: 600, fontSize: '0.8rem'}}>Details</button>
                        {c.status === 'Pending' && (
                          <button 
                            onClick={() => setShowResolveModal(c._id)}
                            style={{color: '#10b981', fontWeight: 600, fontSize: '0.8rem'}}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Side Panel - Worker Overview */}
          <aside className="admin-side-panel">
            <section className="panel-card">
              <div className="panel-header">
                <h3>Worker Status</h3>
              </div>
              <div className="worker-status-list">
                {workers.slice(0, 6).map((w, idx) => (
                  <div key={idx} className="worker-item">
                    <div className="worker-item-info">
                      <strong>{w.name}</strong>
                      <span>{w.dept}</span>
                    </div>
                    <span className={`badge ${w.status === 'Available' ? 'badge-resolved' : 'badge-pending'}`} style={{fontSize: '0.6rem'}}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-header">
                <h3>Department Insights</h3>
              </div>
              <div style={{height: '150px', display: 'flex', alignItems: 'center', justifyItems: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.8rem'}}>
                 <div style={{width: '100%', textAlign: 'center'}}>Visual Data Placeholder</div>
              </div>
            </section>
          </aside>
        </div>
      </main>
      {showResolveModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Complete Task & Resolve</h3>
            <p>Add a completion note and proof for Complaint #{showResolveModal.slice(-5).toUpperCase()}</p>
            <textarea 
              placeholder="e.g. Water leakage repaired successfully."
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              className="modal-input"
            />
            <div className="modal-proof">
              <label>Resolution Proof (Image):</label>
              <div className="proof-placeholder">repair_site.jpg (Selected)</div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowResolveModal(null)} className="btn-cancel">Cancel</button>
              <button onClick={() => handleResolve(showResolveModal)} className="btn-resolve">Mark Resolved</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
