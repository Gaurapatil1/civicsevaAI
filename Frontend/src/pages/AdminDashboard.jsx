import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import './AdminDashboard.css';
import { 
  FaChartLine, FaClipboardList, FaUsers, FaExclamationTriangle,
  FaCheckCircle, FaSignOutAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin' };

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

  if (loading && !data) return <div className="loading-screen">Loading Command Center...</div>;

  const { analytics, recent_complaints, available_workers_summary } = data;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="gov-seal">
            <img src="/pngwing.com (1).png" alt="Gov" className="gov-seal-img" />
          </div>
          <h2>CivicSeva Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin" className="active"><FaChartLine /> Dashboard</a>
          <a href="/"><FaUsers /> Citizen View</a>
          <button onClick={handleLogout} className="logout-btn-sidebar"><FaSignOutAlt /> Logout</button>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Operational Dashboard</h1>
            <p>Smart City Grievance Monitoring System | Central Command</p>
          </div>
          <div className="header-user">
            <div className="user-info">
              <span>Logged in: <strong>{user.name}</strong></span>
              <p>{user.city} Municipal Corp</p>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total"><FaClipboardList /></div>
            <div className="stat-info">
              <h3>{analytics.total_complaints}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon critical"><FaExclamationTriangle /></div>
            <div className="stat-info">
              <h3>{analytics.critical_complaints}</h3>
              <p>Critical Priority</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active"><FaUsers /></div>
            <div className="stat-info">
              <h3>{analytics.active_workers_count}</h3>
              <p>Active Staff</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon resolved"><FaCheckCircle /></div>
            <div className="stat-info">
              <h3>{analytics.high_priority_complaints}</h3>
              <p>High Priority</p>
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          <section className="recent-complaints card">
            <div className="card-header">
              <h2>Recent AI-Allocated Grievances</h2>
              <button className="btn-small" onClick={fetchStats}>Refresh</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>City</th>
                  <th>Grievance</th>
                  <th>Category</th>
                  <th>AI Priority</th>
                  <th>Assigned to</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_complaints.length > 0 ? (
                  recent_complaints.map(c => (
                    <tr key={c._id} className="fade-in">
                      <td>{c.citizen_name || 'Rahul Sharma'}</td>
                      <td>{c.city || 'Mumbai'}</td>
                      <td className="msg-cell" title={c.message}>{c.message}</td>
                      <td><span className="badge-cat">{c.category}</span></td>
                      <td><span className={`badge-priority ${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                      <td>{c.assigned_worker ? c.assigned_worker.name : 'Amit Patil'}</td>
                      <td><span className="badge-status">{c.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No complaints registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="worker-status card">
            <div className="card-header">
              <h2>Staff Availability</h2>
            </div>
            <div className="worker-list">
              {available_workers_summary.map((w, i) => (
                <div key={i} className="worker-item fade-in">
                  <div className="worker-avatar">{w.name[0]}</div>
                  <div className="worker-info">
                    <strong>{w.name}</strong>
                    <span>{w.dept}</span>
                  </div>
                  <div className="worker-status-dot online"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
