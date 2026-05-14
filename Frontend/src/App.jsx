import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenBot from './pages/CitizenBot';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import JanSuvidha from './pages/JanSuvidha';
import './App.css';

// Protected Route for Officers/Admins
const AdminRoute = ({ children }) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Auth error", e);
  }
  
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CitizenBot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/officer" element={
            <AdminRoute>
              <JanSuvidha />
            </AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
