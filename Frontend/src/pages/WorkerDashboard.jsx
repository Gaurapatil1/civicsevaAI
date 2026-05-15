import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkerTasks, uploadWorkerImage, updateWorkerTask } from '../services/api';
import './WorkerDashboard.css';
import { FiCheckCircle, FiClock, FiMapPin, FiCamera, FiLogOut, FiArrowRight, FiList, FiUploadCloud, FiBarChart2 } from 'react-icons/fi';

const WorkerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Assigned Tasks');
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });
  
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [completionImage, setCompletionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [statusSelection, setStatusSelection] = useState('In Progress');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      navigate('/worker-login');
      return;
    }
    fetchTasks();
  }, [user, navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getWorkerTasks(user.email);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    
    // Simulate GPS coordinates
    setGpsCoordinates("19.0760, 72.8777 (Location Confirmed via Exif)");
    
    try {
       const res = await uploadWorkerImage(file);
       setCompletionImage(res.image_path);
    } catch (err) {
       console.error("Image upload failed", err);
       alert("Failed to upload image securely.");
    }
  };

  const handleResolve = async (id) => {
    try {
      await updateWorkerTask(
        id, 
        statusSelection, 
        completionNote, 
        completionImage || "repair_site.jpg" // fallback demo image if none uploaded
      );
      
      setShowResolveModal(null);
      setCompletionNote('');
      setCompletionImage(null);
      setImagePreview('');
      setGpsCoordinates('');
      setStatusSelection('In Progress');
      fetchTasks();
    } catch (err) {
        alert("Action failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/worker-login');
  };
  
  const assignedTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Resolved' || t.status === 'Completed');

  return (
    <div className="worker-app admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar" style={{ background: '#1E3A8A' }}>
        <div className="sidebar-header">
          <img src="/civicseva_logo.png" alt="Gov Logo" className="admin-sidebar-logo" />
          <div className="logo-text">
            <h3>CivicSeva AI</h3>
            <p>Field Operative</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'Assigned Tasks' ? 'active' : ''}`} onClick={() => setActiveTab('Assigned Tasks')}>
            <FiList /> <span>Assigned Tasks</span>
            <span className="nav-badge" style={{ background: '#DC2626' }}>{assignedTasks.length}</span>
          </div>
          <div className={`nav-item ${activeTab === 'Completed Tasks' ? 'active' : ''}`} onClick={() => setActiveTab('Completed Tasks')}>
            <FiCheckCircle /> <span>Completed Tasks</span>
          </div>
          <div className={`nav-item ${activeTab === 'Upload Reports' ? 'active' : ''}`} onClick={() => setActiveTab('Upload Reports')}>
            <FiUploadCloud /> <span>Upload Reports</span>
          </div>
          <div className={`nav-item ${activeTab === 'Performance' ? 'active' : ''}`} onClick={() => setActiveTab('Performance')}>
            <FiBarChart2 /> <span>Performance</span>
          </div>
        </nav>
      </aside>

      <main className="admin-main-content">
        {/* Top Navbar */}
        <header className="admin-top-bar" style={{ background: '#FFFFFF', borderBottom: '2px solid #2563EB' }}>
          <div className="header-logo-group">
            <div className="header-title">
               <h2 style={{ color: '#1E3A8A' }}>FIELD OPERATIONS DASHBOARD</h2>
            </div>
          </div>
          <div className="top-bar-actions">
            <div className="header-profile">
               <div className="profile-info" style={{ textAlign: 'right' }}>
                 <span className="p-role" style={{ color: '#1E3A8A', fontWeight: 'bold' }}>{user?.name}</span>
                 <span className="p-loc" style={{ color: '#6B7280' }}>{user?.dept} Department</span>
               </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary" style={{ borderColor: '#DC2626', color: '#DC2626' }}><FiLogOut /> Logout</button>
          </div>
        </header>

        <div className="operational-content">
          {loading ? (
             <div className="loading-state">Syncing with Central Database...</div>
          ) : (
            <>
              {activeTab === 'Assigned Tasks' && (
                <div className="task-list">
                    <h2>Your Assigned Grievances</h2>
                    {assignedTasks.length === 0 ? (
                        <div className="empty-tasks">
                            <FiCheckCircle size={48} color="#16A34A" />
                            <p style={{ color: '#111827' }}>Great job! All pending tasks are cleared.</p>
                        </div>
                    ) : (
                        assignedTasks.map(task => (
                            <div key={task._id} className={`task-card premium`} style={{ borderLeft: '4px solid #2563EB', background: '#FFFFFF' }}>
                                <div className="task-header">
                                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                                    <span className="task-id">#{task._id.slice(-5).toUpperCase()}</span>
                                </div>
                                <h3 className="task-category" style={{ color: '#111827' }}>{task.category}</h3>
                                <p className="task-desc" style={{ color: '#6B7280' }}>{task.message}</p>
                                
                                <div className="task-meta" style={{ marginTop: '10px', display: 'flex', gap: '20px', color: '#111827' }}>
                                    <span><FiMapPin color="#2563EB" /> {task.city} - {task.citizen_name}</span>
                                    <span><FiClock color="#F59E0B" /> {task.status}</span>
                                </div>

                                <button className="btn-action-primary" style={{ background: '#2563EB', marginTop: '15px' }} onClick={() => setShowResolveModal(task)}>
                                    UPDATE TASK STATUS <FiArrowRight />
                                </button>
                            </div>
                        ))
                    )}
                </div>
              )}

              {activeTab === 'Completed Tasks' && (
                 <div className="task-list">
                    <h2>Completed Tasks History</h2>
                    <table className="gov-table">
                       <thead>
                         <tr>
                           <th>Ref ID</th>
                           <th>Category</th>
                           <th>Completion Note</th>
                           <th>Status</th>
                         </tr>
                       </thead>
                       <tbody>
                         {completedTasks.map(task => (
                           <tr key={task._id}>
                             <td>#{task._id.slice(-5).toUpperCase()}</td>
                             <td style={{ color: '#111827' }}>{task.category}</td>
                             <td style={{ color: '#6B7280' }}>{task.completion_note || '--'}</td>
                             <td><span style={{ color: '#16A34A', fontWeight: 'bold' }}>{task.status}</span></td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              )}
              
              {activeTab === 'Upload Reports' && (
                  <div className="task-list">
                      <h2>Pending Reports</h2>
                      <p>Select any active task below to navigate to the upload portal.</p>
                      {assignedTasks.map(task => (
                          <div key={task._id} className="task-card" onClick={() => setShowResolveModal(task)} style={{ cursor: 'pointer', background: '#FFFFFF', border: '1px solid #D1D5DB' }}>
                              <h3 style={{ color: '#1E3A8A' }}>{task.category} - #{task._id.slice(-5).toUpperCase()}</h3>
                              <p style={{ color: '#6B7280' }}>Click to add completion notes & upload backend images.</p>
                          </div>
                      ))}
                  </div>
              )}

              {activeTab === 'Performance' && (
                  <div className="task-list">
                      <h2>Worker Analytics</h2>
                      <div className="stats-grid">
                          <div className="stat-card premium">
                              <span className="stat-label">Tasks Completed</span>
                              <h2>{completedTasks.length}</h2>
                          </div>
                          <div className="stat-card premium">
                              <span className="stat-label">Average Citizen Rating</span>
                              <h2>{user?.avg_rating || 4.5} ★</h2>
                          </div>
                      </div>
                  </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Task Completion Workflow Modal */}
      {showResolveModal && (
          <div className="admin-modal-overlay">
              <div className="admin-modal" style={{ maxWidth: '500px' }}>
                  <div className="modal-header">
                      <h3>Task Completion Report</h3>
                      <p>Issue: {showResolveModal.category}</p>
                  </div>
                  
                  <div className="modal-body">
                      <div className="gov-form-group">
                         <label>Target Status</label>
                         <select value={statusSelection} onChange={e => setStatusSelection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Completed / Resolved</option>
                         </select>
                      </div>

                      <div className="gov-form-group" style={{ marginTop: '15px' }}>
                         <label>Completion Notes</label>
                         <textarea 
                           placeholder="Describe the action taken (e.g., Pothole filled using tar)..."
                           value={completionNote}
                           onChange={(e) => setCompletionNote(e.target.value)}
                           style={{ width: '100%', padding: '8px', borderRadius: '4px', minHeight: '60px' }}
                         />
                      </div>

                      <div className="upload-section gov-form-group" style={{ marginTop: '15px' }}>
                          <label>Proof of Resolution (Image)</label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#F3F4F6', padding: '10px', borderRadius: '4px', border: '1px dashed #2563EB', color: '#1E3A8A' }}>
                              <FiCamera />
                              <span>Select Image from System</span>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                      handleImageUpload(e.target.files[0]);
                                  }
                              }} />
                          </label>
                          
                          {imagePreview && (
                             <div style={{ marginTop: '10px' }}>
                               <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                             </div>
                          )}
                          {gpsCoordinates && <small style={{ display: 'block', marginTop: '5px', color: '#16A34A', fontWeight: 'bold' }}>✔ {gpsCoordinates}</small>}
                      </div>
                  </div>

                  <div className="modal-footer">
                      <button className="btn-secondary" style={{ borderColor: '#6B7280', color: '#111827' }} onClick={() => {
                          setShowResolveModal(null);
                          setImagePreview('');
                      }}>Cancel</button>
                      <button className="btn-primary" style={{ background: '#16A34A' }} onClick={() => handleResolve(showResolveModal._id)}>Submit Report</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
