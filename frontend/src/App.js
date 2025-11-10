import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import api from './services/api';
import './App.css';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';

function AppContent() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [centers, setCenters] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers');
      setCenters(response.data);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    setSelectedUser(null);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleBackToHome = () => {
    setSelectedUser(null);
    setSelectedCenter(null);
  };

  // Check if we're on admin route
  const isAdminRoute = location.pathname === '/book-distribution-app/admin' || location.pathname === '/admin';

  if (isAdminRoute) {
    return <Admin />;
  }

  if (selectedUser && selectedCenter) {
    return (
      <Dashboard
        user={selectedUser}
        center={selectedCenter}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <HomePage
      centers={centers}
      onCenterSelect={handleCenterSelect}
      onUserSelect={handleUserSelect}
      selectedCenter={selectedCenter}
      onCenterAdded={fetchCenters}
    />
  );
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || '/book-distribution-app'}>
      <AppContent />
    </Router>
  );
}

export default App;

