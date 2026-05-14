import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import './JanSuvidha.css';
import { 
  FaCog, FaSignOutAlt, FaChevronLeft, FaMapMarkerAlt, 
  FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaSpinner 
} from 'react-icons/fa';

const JanSuvidha = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('DASHBOARD'); // DASHBOARD or DETAILS
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stats = await getDashboardStats();
      setData(stats);
    } catch (error) {
      console.error("Fetch error", error);
      // Fallback for demo if backend is slightly delayed or unreachable
      setData({
        analytics: { total_complaints: 0, pending_complaints: 1, resolved_complaints: 0, total_workers: 5, active_workers_count: 5 },
        recent_complaints: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setView('DETAILS');
  };

  const handleBack = () => {
    setView('DASHBOARD');
    setSelectedComplaint(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="js-loading">Jan Suvidha Loading...</div>;

  const { analytics, recent_complaints } = data;

  if (view === 'DETAILS' && selectedComplaint) {
    return (
      <div className="js-mobile-container">
        <header className="js-header">
           <button className="icon-btn" onClick={handleBack}><FaChevronLeft /></button>
           <h1>Complaint Details</h1>
           <div className="spacer"></div>
        </header>

        <main className="js-detail-main">
           <p className="id-text">Complaint ID {selectedComplaint.id || selectedComplaint._id.substring(0, 5)}</p>
           <p className="complaint-msg">{selectedComplaint.message}</p>

           <div className="image-placeholder">
              <span>Image not available</span>
           </div>

           <div className="location-info">
              <strong>Location:</strong> {selectedComplaint.city}, Maharashtra
           </div>

           <div className="form-section">
              <label>Status</label>
              <select className="js-select" defaultValue={selectedComplaint.status}>
                 <option>Pending</option>
                 <option>In Progress</option>
                 <option>Resolved</option>
              </select>
           </div>

           <div className="form-section">
              <textarea placeholder="Add a remark..." className="js-textarea"></textarea>
           </div>

           <button className="btn-js-primary">Mark as Resolved</button>
        </main>
      </div>
    );
  }

  return (
    <div className="js-mobile-container">
      <header className="js-header">
         <h1>Jan Suvidha</h1>
         <div className="header-icons">
            <FaCog className="icon" />
            <FaSignOutAlt className="icon" onClick={handleLogout} />
         </div>
      </header>

      <main className="js-main">
         <div className="js-stats-grid">
            <div className="js-stat-box pending">
               <h2>{analytics.pending_complaints}</h2>
               <p>Pending</p>
            </div>
            <div className="js-stat-box progress">
               <h2>{analytics.total_workers - analytics.active_workers_count}</h2>
               <p>In Progress</p>
            </div>
            <div className="js-stat-box resolved">
               <h2>{analytics.resolved_complaints}</h2>
               <p>Resolved</p>
            </div>
         </div>

         <button className="btn-js-wide">View All Complaints</button>

         <section className="js-recent">
            <h3>Latest Complaints</h3>
            <div className="js-complaint-list">
               {recent_complaints.map((c, i) => (
                 <div key={i} className="js-complaint-item" onClick={() => handleComplaintClick(c)}>
                    <div className="mini-placeholder">Image not available</div>
                    <div className="js-item-info">
                       <strong>{c.category} Not Collected</strong>
                       <span>Mar 4, 2024</span>
                       <small>{c.city}</small>
                    </div>
                    <span className={`js-status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                 </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
};

export default JanSuvidha;
