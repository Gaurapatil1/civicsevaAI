import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkerDashboard.css';
import { 
  FaTasks, FaHistory, FaSignOutAlt, FaMapMarkerAlt, 
  FaClock, FaCheckCircle, FaCamera
} from 'react-icons/fa';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [remark, setRemark] = useState('');
  const [image, setImage] = useState(null);

  const tasks = [
    { id: 'CV00125', title: "Water Leakage Repair", location: "Sector 8, Mumbai", priority: "HIGH", status: "Assigned" },
    { id: 'CV00126', title: "Garbage Collection", location: "MG Road, Pune", priority: "MEDIUM", status: "Assigned" },
  ];

  const handleComplete = (task) => {
    setSelectedTask(task);
    setShowUpload(true);
  };

  const handleSubmitProof = () => {
    // Logic based on PRD Module 1
    alert(`Proof submitted for ${selectedTask.id}.\nGPS: Automatically Captured\nStatus: Pending AI Verification`);
    setShowUpload(false);
    setSelectedTask(null);
    setRemark('');
  };

  return (
    <div className="worker-dashboard-container">
      {/* Sidebar - PRD Focused */}
      <aside className="worker-sidebar">
        <div className="sidebar-header">
           <div className="logo-icon">🏛️</div>
           <div className="logo-text">
             <h3>CivicSevaAI</h3>
             <p>ADMINISTRATION</p>
           </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active"><FaTasks /> Assigned Work</div>
          <div className="nav-item"><FaHistory /> Submission History</div>
          <div className="nav-item logout" onClick={() => navigate('/login')}><FaSignOutAlt /> Sign Out</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="worker-main-content">
        <header className="worker-header">
           <h2>Assigned Tasks</h2>
           <div className="employee-badge">
             <strong>Employee ID: E-442</strong>
           </div>
        </header>

        <section className="tasks-section-prd">
           <div className="tasks-grid">
              {tasks.map(task => (
                <div className="task-card-prd" key={task.id}>
                   <div className="card-top">
                      <span className={`tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="task-id">{task.id}</span>
                   </div>
                   <h4>{task.title}</h4>
                   <p><FaMapMarkerAlt /> {task.location}</p>
                   <button 
                     className="btn-complete-prd" 
                     onClick={() => handleComplete(task)}
                   >
                     Mark Work Completed
                   </button>
                </div>
              ))}
           </div>
        </section>

        {/* PRD Module 1: Proof Submission Modal */}
        {showUpload && (
          <div className="modal-overlay">
            <div className="proof-modal">
               <h3>Submit Work Verification</h3>
               <p className="modal-subtitle">Complaint: <strong>{selectedTask.id}</strong></p>
               
               <div className="upload-box-prd">
                  <div className="file-input-wrapper">
                     <FaCamera className="upload-icon" />
                     <p>Capture/Upload Completion Photo</p>
                     <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                  </div>
                  <div className="gps-indicator-prd">
                     <FaMapMarkerAlt /> GPS Tracking: 18.5204, 73.8567 (Verified)
                  </div>
               </div>

               <div className="remarks-section">
                  <label>Completion Remarks</label>
                  <textarea 
                    placeholder="Enter details about the resolution..." 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="remarks-area"
                  />
               </div>

               <div className="modal-actions">
                  <button onClick={() => setShowUpload(false)} className="btn-cancel">Back</button>
                  <button onClick={handleSubmitProof} className="btn-submit-prd">Submit for Verification</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
