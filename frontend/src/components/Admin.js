import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Admin.css';

const BOOK_TYPES = [
  { value: 'MB', label: 'MB - Mega Big' },
  { value: 'B', label: 'B - Big' },
  { value: 'M', label: 'M - Medium' },
  { value: 'S', label: 'S - Small' },
  { value: 'SB', label: 'SB - Srimad Bhagavatam' },
  { value: 'CC', label: 'CC - Chaitanya Charita Mrita' }
];

const BOOK_TYPE_POINTS = {
  'MB': 2,
  'B': 1,
  'M': 0.5,
  'S': 0.25,
  'SB': 72,
  'CC': 36
};

const BOOK_LANGUAGES = [
  { value: 'Hindi', label: 'Hindi' },
  { value: 'English', label: 'English' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Oriya', label: 'Oriya' },
  { value: 'Marathi', label: 'Marathi' }
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formData, setFormData] = useState({ type: '', language: '', name: '', price: '', point: '' });
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
    const bookType = book.type || '';
    const points = bookType && BOOK_TYPE_POINTS[bookType] !== undefined 
      ? BOOK_TYPE_POINTS[bookType].toString() 
      : book.point.toString();
    setFormData({
      type: bookType,
      language: book.language || '',
      name: book.name,
      price: book.price.toString(),
      point: points
    });
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setFormData({ type: '', language: '', name: '', price: '', point: '' });
  };

  const handleUpdateBook = async (bookId) => {
    try {
      // Get points from type mapping if type is set, otherwise use form value
      const points = formData.type && BOOK_TYPE_POINTS[formData.type] !== undefined
        ? BOOK_TYPE_POINTS[formData.type]
        : parseFloat(formData.point);
      
      const updateData = {
        type: formData.type,
        language: formData.language,
        name: formData.name,
        price: parseFloat(formData.price),
        point: points
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
                    <th>Type</th>
                    <th>Language</th>
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
                            <select
                              value={formData.type}
                              onChange={(e) => {
                                const selectedType = e.target.value;
                                const points = selectedType && BOOK_TYPE_POINTS[selectedType] !== undefined
                                  ? BOOK_TYPE_POINTS[selectedType].toString()
                                  : formData.point;
                                setFormData({ ...formData, type: selectedType, point: points });
                              }}
                              className="admin-input"
                            >
                              <option value="">-- Select Type --</option>
                              {BOOK_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={formData.language}
                              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                              className="admin-input"
                            >
                              <option value="">-- Select Language --</option>
                              {BOOK_LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                  {lang.label}
                                </option>
                              ))}
                            </select>
                          </td>
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
                              step="0.01"
                              value={formData.point}
                              readOnly
                              className="admin-input"
                              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
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
                          <td>{book.type || 'N/A'}</td>
                          <td>{book.language || 'N/A'}</td>
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

