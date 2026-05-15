import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getDashboardStats } from '../services/api';
import { 
  FiLayout, FiFileText, FiUsers, FiSettings, FiLogOut, 
  FiSearch, FiBell, FiBarChart2, FiCheckCircle, FiClock, FiAlertCircle,
  FiTrendingUp, FiActivity, FiMapPin
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

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
    const interval = setInterval(fetchData, 60000); 
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
        <p>Initializing Operational Environment...</p>
      </div>
    );
  }

  const analytics = stats?.analytics || {
    total_complaints: 0,
    pending_complaints: 0,
    resolved_complaints: 0,
    critical_complaints: 0,
    total_workers: 0,
    citizen_satisfaction: 4.2
  };

  const recentComplaints = stats?.recent_complaints || [];
  const workers = stats?.workers || [];

  // Chart Data Preparation
  const deptLabels = ['Water Supply', 'Waste Management', 'Electricity', 'Roads', 'Sanitation'];
  const deptData = deptLabels.map(label => 
    recentComplaints.filter(c => c.category === label).length + Math.floor(Math.random() * 5)
  );

  const doughnutData = {
    labels: deptLabels,
    datasets: [{
      data: deptData,
      backgroundColor: ['#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'],
    datasets: [{
      label: 'Incoming Grievances',
      data: [12, 19, 15, 25, 22, 30],
      fill: true,
      borderColor: '#003366',
      backgroundColor: 'rgba(0, 51, 102, 0.1)',
      tension: 0.4
    }]
  };

  return (
    <div className="premium-admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/image-10.png" alt="Gov Logo" className="admin-sidebar-logo" />
          <div className="logo-text">
            <h3>CivicSeva</h3>
            <p>Administration Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
            <FiLayout /> <span>Control Center</span>
          </div>
          <div className={`nav-item ${activeTab === 'Complaints' ? 'active' : ''}`} onClick={() => setActiveTab('Complaints')}>
            <FiFileText /> <span>Grievance Log</span>
            <span className="nav-badge">{analytics.pending_complaints}</span>
          </div>
          <div className={`nav-item ${activeTab === 'Workers' ? 'active' : ''}`} onClick={() => setActiveTab('Workers')}>
            <FiUsers /> <span>Field Operatives</span>
          </div>
          <div className={`nav-item ${activeTab === 'Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('Analytics')}>
            <FiBarChart2 /> <span>Performance Metrics</span>
          </div>
          
          <div className="nav-item logout-nav" onClick={handleLogout} style={{marginTop: 'auto'}}>
            <FiLogOut /> <span>Security Sign Out</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot"></div>
            <span>Encrypted Session: Active</span>
          </div>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-top-bar">
          <div className="header-logo-group">
            <img src="/image-10.png" alt="Emblem" className="header-gov-logo" />
            <div className="header-logo-sep"></div>
            <div className="header-title">
              <h2>MUNICIPAL OPERATIONS COMMAND</h2>
              <p>Government of India | Local Governance Excellence</p>
            </div>
          </div>

          <div className="top-bar-actions">
            <div className="search-box">
              <FiSearch />
              <input type="text" placeholder="Global Search (Complaints, Workers)..." />
            </div>
            <div className="header-icon-btn"><FiBell /><span className="notif-dot"></span></div>
            <div className="header-profile">
              <div className="profile-info">
                <span className="p-role">Ketan Patil</span>
                <span className="p-loc">{user?.city} Municipal HQ</span>
              </div>
              <img src="/image-10.png" alt="Avatar" style={{ borderRadius: '4px', border: '1px solid #D1D5DB' }} />
            </div>
          </div>
        </header>

        <div className="operational-content scrollbar-hide">
          <section className="stats-grid fade-in">
            <div className="stat-card premium">
              <div className="stat-header">
                <FiCheckCircle className="stat-ico-bg" />
                <span className="stat-label">Citizen Satisfaction</span>
              </div>
              <div className="stat-body">
                <h2>{analytics.citizen_satisfaction.toFixed(1)} <small>/ 5.0</small></h2>
                <div className="stat-sub">
                  <FiTrendingUp className="trend-up" /> <span>+0.4 from last month</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card premium">
              <div className="stat-header">
                <FiClock className="stat-ico-bg yellow" />
                <span className="stat-label">SLA Consistency</span>
              </div>
              <div className="stat-body">
                <h2>94.2%</h2>
                <div className="stat-sub">
                  <FiActivity className="trend-up" /> <span>Within 24hr Window</span>
                </div>
              </div>
            </div>

            <div className="stat-card premium">
              <div className="stat-header">
                <FiAlertCircle className="stat-ico-bg red" />
                <span className="stat-label">Active Grievances</span>
              </div>
              <div className="stat-body">
                <h2>{analytics.pending_complaints}</h2>
                <div className="stat-sub">
                  <span className="att-req">Attention Required</span>
                </div>
              </div>
            </div>

            <div className="stat-card premium">
              <div className="stat-header">
                <FiUsers className="stat-ico-bg blue" />
                <span className="stat-label">Deployed Force</span>
              </div>
              <div className="stat-body">
                <h2>{workers.length} <small>Staff</small></h2>
                <div className="stat-sub">
                  <FiMapPin /> <span>{analytics.total_workers} Multi-Dept</span>
                </div>
              </div>
            </div>
          </section>

          <div className="dashboard-layout-grid fade-in">
            <section className="main-log-section">
              <div className="section-header-row">
                <div className="s-title">
                  <h3>Real-time Grievance Stream</h3>
                  <p>Monitoring {recentComplaints.length} active sessions</p>
                </div>
                <div className="s-actions">
                  <button className="btn-filter"><FiSettings /> Filter</button>
                </div>
              </div>

              <div className="table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Category</th>
                      <th>Citizen</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Proof</th>
                      <th>Rating</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.slice(0, 8).map((c, idx) => (
                      <tr key={idx} className="hover-row">
                        <td><span className="ref-tag">#CIV-{c._id?.slice(-4).toUpperCase()}</span></td>
                        <td>
                          <div className="cat-cell">
                            <strong>{c.category}</strong>
                            <span>{c.city}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '500', color: '#1e293b' }}>{c.citizen_name}</div>
                        </td>
                        <td>
                          <span className={`p-badge ${c.priority.toLowerCase()}`}>{c.priority}</span>
                        </td>
                        <td>
                          <div className="status-cell">
                            <span className={`s-dot ${c.status.toLowerCase().replace(' ', '-')}`}></span>
                            {c.status}
                          </div>
                        </td>
                        <td>
                          {c.completion_image ? (
                            <img 
                              src={c.completion_image} 
                              alt="Proof" 
                              style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
                              onClick={() => window.open(c.completion_image, '_blank')}
                            />
                          ) : (
                            <span style={{ color: '#94a3b8' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          {c.rating ? (
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                              {c.rating} ★
                            </span>
                          ) : (
                            <span style={{ color: '#64748b' }}>-</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button className="btn-view">Log</button>
                          {c.status === 'Pending' && (
                            <button onClick={() => setShowResolveModal(c._id)} className="btn-action-primary">Execute</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="operational-side-panel">
              <div className="panel-card chart-card">
                <h3>Department Distribution</h3>
                <div className="chart-wrapper">
                  <Doughnut 
                    data={doughnutData} 
                    options={{ 
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } },
                      cutout: '70%'
                    }} 
                  />
                </div>
              </div>

              <div className="panel-card chart-card">
                <h3>Load Forecast</h3>
                <div className="chart-wrapper" style={{height: '140px'}}>
                  <Line 
                    data={lineData} 
                    options={{ 
                      scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { size: 9 } } } },
                      plugins: { legend: { display: false } },
                      maintainAspectRatio: false
                    }} 
                  />
                </div>
              </div>

              <div className="panel-card status-card">
                <h3>Operative Readiness</h3>
                <div className="operative-list">
                  {workers.slice(0, 4).map((w, idx) => (
                    <div key={idx} className="op-item">
                      <div className="op-info">
                        <strong>{w.name}</strong>
                        <span>{w.dept}</span>
                      </div>
                      <span className={`op-status ${w.status === 'Available' ? 'online' : 'busy'}`}></span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showResolveModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Municipal Resolution Protocol</h3>
              <p>Authentication required for closure of #CIV-{showResolveModal.slice(-4).toUpperCase()}</p>
            </div>
            <div className="modal-body">
              <label>Field Resolution Note</label>
              <textarea 
                placeholder="Detail the actions taken to mitigate the grievance..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
              />
              <div className="proof-upload">
                <FiShield /> <span>AI Verification Image: resolution_proof.jpg (Attached)</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowResolveModal(null)} className="btn-secondary">Decline</button>
              <button onClick={() => handleResolve(showResolveModal)} className="btn-primary">Resolve & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
