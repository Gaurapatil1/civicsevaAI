import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CitizenBot from './pages/CitizenBot';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import './App.css';

// Protected Route for Officers/Admins
const AdminRoute = ({ children, role }) => {
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      user = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error("Auth error", e);
  }
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  console.log("App Component Init");
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/bot" element={<CitizenBot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/admin" element={
            <AdminRoute role="admin">
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/worker-dashboard" element={
            <AdminRoute role="worker">
              <WorkerDashboard />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
