import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenBot from './pages/CitizenBot';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Main Bot Page (Handles Auth Conversationaly) */}
          <Route path="/" element={<CitizenBot />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
