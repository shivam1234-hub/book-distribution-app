import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UserAnalytics.css';

const UserAnalytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/users/${user._id}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
    <div className="user-analytics">
      <h2>My Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{analytics.user.points}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{analytics.totalDistributions}</div>
          <div className="stat-label">Books Distributed</div>
        </div>
        <div className="stat-card donation">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{analytics.user.totalDonation.toFixed(2)}</div>
          <div className="stat-label">Total Donation</div>
        </div>
        <div className="stat-card loss">
          <div className="stat-icon">📉</div>
          <div className="stat-value">₹{analytics.user.totalLoss.toFixed(2)}</div>
          <div className="stat-label">Total Loss</div>
        </div>
      </div>

      <div className="book-distribution-section">
        <h3>Book Distribution Details</h3>
        {analytics.bookDistribution.length > 0 ? (
          <div className="book-list">
            {analytics.bookDistribution.map((item, index) => (
              <div key={index} className="book-item">
                <div className="book-name">{item.book.name}</div>
                <div className="book-meta">
                  {item.book.language && <span className="book-language">Language: {item.book.language}</span>}
                  <span className="book-type">Type: {item.book.type}</span>
                </div>
                <div className="book-stats">
                  <div className="book-count">Count: {item.count}</div>
                  <div className="book-points">Points: {item.book.point * item.count}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No distributions yet</div>
        )}
      </div>
    </div>
  );
};

export default UserAnalytics;

