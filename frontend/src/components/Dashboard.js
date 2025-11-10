import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';
import AddDistribution from './AddDistribution';
import UserAnalytics from './UserAnalytics';
import CenterAnalytics from './CenterAnalytics';
import DailyAnalytics from './DailyAnalytics';

const Dashboard = ({ user, center, onBack }) => {
  const [activeTab, setActiveTab] = useState('add');
  const [userData, setUserData] = useState(user);
  const [centerData, setCenterData] = useState(center);

  useEffect(() => {
    fetchUserData();
    fetchCenterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${user._id}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCenterData = async () => {
    try {
      const response = await api.get(`/centers/${center._id}`);
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
          <button
            className={`sidebar-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            📅 Daily Activity
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'add' && (
            <AddDistribution
              user={userData}
              onDistributionAdded={handleDistributionAdded}
              onBookAdded={() => {}}
            />
          )}
          {activeTab === 'user' && (
            <UserAnalytics
              user={userData}
            />
          )}
          {activeTab === 'center' && (
            <CenterAnalytics
              center={centerData}
            />
          )}
          {activeTab === 'daily' && (
            <DailyAnalytics
              center={centerData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

