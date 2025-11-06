import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import AddDistribution from './AddDistribution';
import UserAnalytics from './UserAnalytics';
import CenterAnalytics from './CenterAnalytics';

const Dashboard = ({ user, center, onBack, apiUrl }) => {
  const [activeTab, setActiveTab] = useState('add');
  const [books, setBooks] = useState([]);
  const [userData, setUserData] = useState(user);
  const [centerData, setCenterData] = useState(center);

  useEffect(() => {
    fetchBooks();
    fetchUserData();
    fetchCenterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${apiUrl}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users/${user._id}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCenterData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/centers/${center._id}`);
      setCenterData(response.data);
    } catch (error) {
      console.error('Error fetching center data:', error);
    }
  };

  const handleDistributionAdded = () => {
    fetchUserData();
    fetchCenterData();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="header-info">
          <h2>{userData.name}</h2>
          <p>{centerData.name} • {userData.number}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <button
            className={`sidebar-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            📖 Add Distribution
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            👤 My Analytics
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'center' ? 'active' : ''}`}
            onClick={() => setActiveTab('center')}
          >
            🏢 Center Analytics
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'add' && (
            <AddDistribution
              user={userData}
              books={books}
              apiUrl={apiUrl}
              onDistributionAdded={handleDistributionAdded}
              onBookAdded={fetchBooks}
            />
          )}
          {activeTab === 'user' && (
            <UserAnalytics
              user={userData}
              apiUrl={apiUrl}
            />
          )}
          {activeTab === 'center' && (
            <CenterAnalytics
              center={centerData}
              apiUrl={apiUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

