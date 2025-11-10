import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CenterAnalytics.css';

const CenterAnalytics = ({ center }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [center._id]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/centers/${center._id}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching center analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">Error loading analytics</div>;
  }

  return (
    <div className="center-analytics">
      <h2>Center Analytics: {analytics.center.name}</h2>

      <div className="center-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{analytics.center.points}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{analytics.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card donation">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{analytics.center.donation.toFixed(2)}</div>
          <div className="stat-label">Total Donation</div>
        </div>
        <div className="stat-card loss">
          <div className="stat-icon">📉</div>
          <div className="stat-value">₹{analytics.center.loss.toFixed(2)}</div>
          <div className="stat-label">Total Loss</div>
        </div>
      </div>

      <div className="book-analytics-section">
        <h3>Type-wise Analytics</h3>
        {analytics.typeAnalytics && analytics.typeAnalytics.length > 0 ? (
          <div className="book-analytics-table">
            <div className="table-header">
              <div className="col-name">Book Type</div>
              <div className="col-count">Count</div>
              <div className="col-price">Total Price (₹)</div>
              <div className="col-points">Total Points</div>
              <div className="col-donation">Donation (₹)</div>
            </div>
            {analytics.typeAnalytics.map((item, index) => (
              <div key={index} className="table-row">
                <div className="col-name">{item.type}</div>
                <div className="col-count">{item.count}</div>
                <div className="col-price">₹{item.totalPrice.toFixed(2)}</div>
                <div className="col-points">{item.totalPoints}</div>
                <div className="col-donation">₹{item.totalDonation.toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No book distributions yet</div>
        )}
      </div>
    </div>
  );
};

export default CenterAnalytics;

