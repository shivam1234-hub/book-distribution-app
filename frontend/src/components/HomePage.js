import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './HomePage.css';

const HomePage = ({ centers, onCenterSelect, onUserSelect, selectedCenter, onCenterAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserNumber, setNewUserNumber] = useState('');
  const [newCenterName, setNewCenterName] = useState('');
  const [showAddCenter, setShowAddCenter] = useState(false);

  useEffect(() => {
    if (selectedCenter) {
      fetchUsers();
    } else {
      setUsers([]);
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter, searchQuery]);

  const fetchUsers = async () => {
    if (!selectedCenter) return;
    
    setLoading(true);
    try {
      const response = await api.get('/users/search', {
        params: {
          centerId: selectedCenter._id,
          query: searchQuery
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserNumber.trim()) {
      alert('Please enter both name and phone number');
      return;
    }

    try {
      await api.post('/users', {
        name: newUserName.trim(),
        number: newUserNumber.trim(),
        centerId: selectedCenter._id
      });
      setNewUserName('');
      setNewUserNumber('');
      setSearchQuery('');
      fetchUsers();
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  };

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  const handleAddCenter = async (e) => {
    e.preventDefault();
    if (!newCenterName.trim()) {
      alert('Please enter a center name');
      return;
    }

    try {
      await api.post('/centers', {
        name: newCenterName.trim()
      });
      setNewCenterName('');
      setShowAddCenter(false);
      alert('Center added successfully!');
      if (onCenterAdded) {
        onCenterAdded();
      }
    } catch (error) {
      console.error('Error adding center:', error);
      if (error.response?.data?.error?.includes('duplicate') || error.response?.data?.error?.includes('unique')) {
        alert('Center with this name already exists!');
      } else {
        alert('Error adding center. Please try again.');
      }
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">📚 Book Distribution Competition</h1>
        
        <div className="center-selector">
          <div className="center-selector-header">
            <label htmlFor="center-select">Select Center:</label>
            <button 
              type="button"
              onClick={() => setShowAddCenter(!showAddCenter)}
              className="btn-add-center"
            >
              {showAddCenter ? '✕ Cancel' : '+ Add Center'}
            </button>
          </div>
          
          {showAddCenter && (
            <div className="add-center-form">
              <form onSubmit={handleAddCenter}>
                <input
                  type="text"
                  placeholder="Enter center name"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
                <button type="submit" className="btn-primary">Add Center</button>
              </form>
            </div>
          )}

          <select
            id="center-select"
            value={selectedCenter?._id || ''}
            onChange={(e) => {
              const center = centers.find(c => c._id === e.target.value);
              onCenterSelect(center || null);
            }}
            className="center-dropdown"
          >
            <option value="">-- Choose Center --</option>
            {centers.map(center => (
              <option key={center._id} value={center._id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCenter && (
          <div className="user-section">
            <div className="add-user-form">
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="form-input"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newUserNumber}
                  onChange={(e) => setNewUserNumber(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="btn-primary">Add User</button>
              </form>
            </div>

            <div className="user-search">
              <h3>Search User</h3>
              <input
                type="text"
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="user-list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : users.length > 0 ? (
                users.map(user => (
                  <div
                    key={user._id}
                    className="user-card"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-number">{user.number}</span>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="no-results">No users found</div>
              ) : (
                <div className="no-results">Start typing to search users...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

