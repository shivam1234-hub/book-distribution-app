import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './DailyAnalytics.css';

const DailyAnalytics = ({ center }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center._id]);

  const fetchAnalytics = async () => {
    try {
      // Get today's date in YYYY-MM-DD format (client's local timezone)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const response = await api.get(`/centers/${center._id}/daily-analytics?date=${todayStr}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching daily analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading daily analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">Error loading daily analytics</div>;
  }

  // Use client's local date for display (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="daily-analytics">
      <div className="daily-header">
        <h2>📅 Daily Activity Analytics</h2>
        <p className="date-display">{formattedDate}</p>
      </div>

      <div className="daily-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{analytics.totalPoints}</div>
          <div className="stat-label">Total Points Today</div>
        </div>
        <div className="stat-card donation">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{analytics.totalDonation.toFixed(2)}</div>
          <div className="stat-label">Total Donation Today</div>
        </div>
        <div className="stat-card loss">
          <div className="stat-icon">📉</div>
          <div className="stat-value">₹{analytics.totalLoss.toFixed(2)}</div>
          <div className="stat-label">Total Loss Today</div>
        </div>
      </div>

      <div className="book-analytics-section">
        <h3>📊 Type-wise Daily Distribution</h3>
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
          <div className="no-data">No books distributed today</div>
        )}
      </div>

      <div className="book-distribution-section">
        <h3>📚 Book Distribution Details</h3>
        {analytics.bookDistribution && analytics.bookDistribution.length > 0 ? (
          <div className="book-list">
            {analytics.bookDistribution.map((item, index) => (
              <div key={index} className="book-item">
                <div className="book-name">{item.book.name}</div>
                <div className="book-meta">
                  {item.book.language && <span className="book-language">Language: {item.book.language}</span>}
                  <span className="book-type">Type: {item.book.type}</span>
                </div>
                <div className="book-stats">
                  <div className="book-count">Count: <strong>{item.count}</strong></div>
                  <div className="book-points">Points: <strong>{item.book.point * item.count}</strong></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No books distributed today</div>
        )}
      </div>

      <div className="top-devotees-section">
        <h3>🏆 Top 3 Devotees Today</h3>
        {analytics.topDevotees.length > 0 ? (
          <div className="devotees-list">
            {analytics.topDevotees.map((devotee, index) => (
              <div key={devotee.user._id} className={`devotee-item rank-${index + 1}`}>
                <div className="rank-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
                <div className="devotee-info">
                  <div className="devotee-name">{devotee.user.name}</div>
                  <div className="devotee-number">{devotee.user.number}</div>
                </div>
                <div className="devotee-stats">
                  <div className="devotee-stat">
                    <span className="stat-label-small">Books</span>
                    <span className="stat-value-small">{devotee.count}</span>
                  </div>
                  <div className="devotee-stat">
                    <span className="stat-label-small">Points</span>
                    <span className="stat-value-small">{devotee.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No distributions today</div>
        )}
      </div>
    </div>
  );
};

export default DailyAnalytics;

