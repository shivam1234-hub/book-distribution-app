import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', point: '' });
  const [centerFormData, setCenterFormData] = useState({ name: '' });

  useEffect(() => {
    fetchBooks();
    fetchCenters();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers/admin/all-analytics');
      setCenters(response.data);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book._id);
    setFormData({
      name: book.name,
      price: book.price.toString(),
      point: book.point.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setFormData({ name: '', price: '', point: '' });
  };

  const handleUpdateBook = async (bookId) => {
    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        point: parseFloat(formData.point)
      };

      await api.put(`/books/${bookId}`, updateData);
      await fetchBooks();
      handleCancelEdit();
      alert('Book updated successfully!');
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await api.delete(`/books/${bookId}`);
      await fetchBooks();
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book. Please try again.');
    }
  };

  const handleEditCenter = (center) => {
    setEditingCenter(center._id);
    setCenterFormData({ name: center.name });
  };

  const handleCancelEditCenter = () => {
    setEditingCenter(null);
    setCenterFormData({ name: '' });
  };

  const handleUpdateCenter = async (centerId) => {
    try {
      await api.put(`/centers/${centerId}`, { name: centerFormData.name });
      await fetchCenters();
      handleCancelEditCenter();
      alert('Center updated successfully!');
    } catch (error) {
      console.error('Error updating center:', error);
      alert('Error updating center. Please try again.');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🔧 Admin Panel</h1>
        <p>Manage Books and Centers</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 Books Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'centers' ? 'active' : ''}`}
          onClick={() => setActiveTab('centers')}
        >
          🏢 Centers Management
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'books' && (
          <div className="books-section">
            <h2>Books Management</h2>
            <div className="books-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book Name</th>
                    <th>Price (₹)</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      {editingBook === book._id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="admin-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="admin-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="1"
                              value={formData.point}
                              onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                              className="admin-input"
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => handleUpdateBook(book._id)}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{book.name}</td>
                          <td>₹{book.price.toFixed(2)}</td>
                          <td>{book.point}</td>
                          <td>
                            <button
                              onClick={() => handleEditBook(book)}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {books.length === 0 && (
                <div className="no-data">No books found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'centers' && (
          <div className="centers-section">
            <h2>Centers Management</h2>
            <div className="centers-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Center Name</th>
                    <th>Total Points</th>
                    <th>Total Donation (₹)</th>
                    <th>Total Loss (₹)</th>
                    <th>Total Users</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {centers.map((center) => (
                    <tr key={center._id}>
                      {editingCenter === center._id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={centerFormData.name}
                              onChange={(e) => setCenterFormData({ name: e.target.value })}
                              className="admin-input"
                            />
                          </td>
                          <td>{center.points}</td>
                          <td>₹{center.donation.toFixed(2)}</td>
                          <td>₹{center.loss.toFixed(2)}</td>
                          <td>{center.totalUsers}</td>
                          <td>
                            <button
                              onClick={() => handleUpdateCenter(center._id)}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditCenter}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{center.name}</td>
                          <td>{center.points}</td>
                          <td>₹{center.donation.toFixed(2)}</td>
                          <td>₹{center.loss.toFixed(2)}</td>
                          <td>{center.totalUsers}</td>
                          <td>
                            <button
                              onClick={() => handleEditCenter(center)}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {centers.length === 0 && (
                <div className="no-data">No centers found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

