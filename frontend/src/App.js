import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8083/api';

function App() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await axios.get(`${API_URL}/centers`);
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
        apiUrl={API_URL}
      />
    );
  }

  return (
    <HomePage
      centers={centers}
      onCenterSelect={handleCenterSelect}
      onUserSelect={handleUserSelect}
      selectedCenter={selectedCenter}
      apiUrl={API_URL}
      onCenterAdded={fetchCenters}
    />
  );
}

export default App;

