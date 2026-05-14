import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './WorkerDashboard.css';
import { FiCheckCircle, FiClock, FiMapPin, FiCamera, FiLogOut, FiArrowRight } from 'react-icons/fi';

const WorkerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      // For demo purposes, we'll allow admin to view this too, or redirect if strictly worker
      if (!user) navigate('/login');
    }
    fetchTasks();
  }, [user, navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // In a real app, we'd fetch tasks assigned to this specific worker ID
      // For demo, we'll fetch all and filter or just show recent relevant ones
      const response = await api.get('/dashboard/stats');
      const allComplaints = response.data.recent_complaints || [];
      // Filter for tasks where worker name matches or just show all for demo
      setTasks(allComplaints.filter(c => c.status !== 'Resolved'));
    } catch (err) {
      console.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/complaints/${id}/resolve`, {
        completion_note: completionNote,
        completion_image: "repair_site.jpg"
      });
      setShowResolveModal(null);
      setCompletionNote('');
      fetchTasks();
    } catch (err) {
        alert("Action failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="worker-app">
      <header className="worker-header">
        <div className="brand">
          <img src="/civicseva_logo.png" alt="Gov Logo" />
          <span>FIELD OPERATIVE CONSOLE</span>
        </div>
        <div className="worker-info">
          <span>{user?.name || 'Field Worker'}</span>
          <button onClick={handleLogout} className="logout-icon"><FiLogOut /></button>
        </div>
      </header>

      <main className="worker-content">
        <section className="summary-banner">
          <div className="sum-item">
            <span className="label">Active Tasks</span>
            <span className="val">{tasks.length}</span>
          </div>
          <div className="sum-item">
            <span className="label">Performance</span>
            <span className="val">4.8 ★</span>
          </div>
        </section>

        <h2 className="section-title">Your Assigned Grievances</h2>

        {loading ? (
            <div className="loading-state">Syncing with Command Center...</div>
        ) : (
            <div className="task-list">
                {tasks.length === 0 ? (
                    <div className="empty-tasks">
                        <FiCheckCircle size={48} color="#10b981" />
                        <p>All tasks completed! No pending assignments.</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task._id} className={`task-card p-${task.priority.toLowerCase()}`}>
                            <div className="task-header">
                                <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                                <span className="task-id">#{task._id.slice(-5).toUpperCase()}</span>
                            </div>
                            <h3 className="task-category">{task.category}</h3>
                            <p className="task-desc">{task.message}</p>
                            
                            <div className="task-meta">
                                <span><FiMapPin /> {task.city}</span>
                                <span><FiClock /> {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>

                            <button className="btn-action" onClick={() => setShowResolveModal(task)}>
                                UPDATE TASK STATUS <FiArrowRight />
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}
      </main>

      {showResolveModal && (
          <div className="modal-overlay">
              <div className="resolve-modal">
                  <h3>Mark Task as Resolved</h3>
                  <p>Issue: {showResolveModal.category}</p>
                  
                  <label>Work Summary</label>
                  <textarea 
                    placeholder="Describe the action taken..."
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                  />

                  <div className="upload-section">
                      <FiCamera />
                      <span>Upload Proof of Resolution</span>
                      <small>repair_site.jpg attached</small>
                  </div>

                  <div className="modal-btns">
                      <button className="cancel" onClick={() => setShowResolveModal(null)}>Cancel</button>
                      <button className="confirm" onClick={() => handleResolve(showResolveModal._id)}>Submit Completion</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
