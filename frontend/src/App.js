import React, { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [centers, setCenters] = useState([]);

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

export default App;

