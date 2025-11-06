import React, { useState } from 'react';
import axios from 'axios';
import './AddDistribution.css';

const AddDistribution = ({ user, books, apiUrl, onDistributionAdded, onBookAdded }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookPoint, setNewBookPoint] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBook || !pricePaid) {
      alert('Please select a book and enter the price paid');
      return;
    }

    const price = parseFloat(pricePaid);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/users/${user._id}/distribution`, {
        bookId: selectedBook,
        pricePaid: price
      });
      
      setSelectedBook('');
      setPricePaid('');
      alert('Distribution added successfully!');
      onDistributionAdded();
    } catch (error) {
      console.error('Error adding distribution:', error);
      alert('Error adding distribution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBookName.trim() || !newBookPoint || !newBookPrice) {
      alert('Please enter book name, points, and price');
      return;
    }

    const point = parseFloat(newBookPoint);
    const price = parseFloat(newBookPrice);
    
    if (isNaN(point) || point < 0 || isNaN(price) || price < 0) {
      alert('Please enter valid numbers for points and price');
      return;
    }

    try {
      await axios.post(`${apiUrl}/books`, {
        name: newBookName.trim(),
        point: point,
        price: price
      });
      setNewBookName('');
      setNewBookPoint('');
      setNewBookPrice('');
      setShowAddBook(false);
      alert('Book added successfully!');
      if (onBookAdded) {
        onBookAdded();
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book. Please try again.');
    }
  };

  const selectedBookData = books.find(b => b._id === selectedBook);

  return (
    <div className="add-distribution">
      <h2>Add Book Distribution</h2>
      
      <div className="book-selector-section">
        <div className="book-selector-header">
          <label htmlFor="book-select">Select Book:</label>
          <button 
            type="button"
            onClick={() => setShowAddBook(!showAddBook)}
            className="btn-add-book"
          >
            {showAddBook ? '✕ Cancel' : '+ Add Book'}
          </button>
        </div>

        {showAddBook && (
          <div className="add-book-form">
            <form onSubmit={handleAddBook}>
              <input
                type="text"
                placeholder="Book Name"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                className="form-input"
                autoFocus
              />
              <input
                type="number"
                step="1"
                min="0"
                placeholder="Points"
                value={newBookPoint}
                onChange={(e) => setNewBookPoint(e.target.value)}
                className="form-input"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price (₹)"
                value={newBookPrice}
                onChange={(e) => setNewBookPrice(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="btn-primary">Add Book</button>
            </form>
          </div>
        )}

        <select
          id="book-select"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="form-select"
        >
          <option value="">-- Choose Book --</option>
          {books.map(book => (
            <option key={book._id} value={book._id}>
              {book.name} - Points: {book.point}, Price: ₹{book.price}
            </option>
          ))}
        </select>
      </div>
      
      <form onSubmit={handleSubmit} className="distribution-form">

        {selectedBookData && (
          <div className="book-info">
            <div className="info-item">
              <span className="info-label">Book Name:</span>
              <span className="info-value">{selectedBookData.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Points:</span>
              <span className="info-value">{selectedBookData.point}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Original Price:</span>
              <span className="info-value">₹{selectedBookData.price}</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="price-paid">Price Paid (₹):</label>
          <input
            id="price-paid"
            type="number"
            step="0.01"
            min="0"
            value={pricePaid}
            onChange={(e) => setPricePaid(e.target.value)}
            placeholder="Enter amount paid"
            className="form-input"
          />
        </div>

        {selectedBookData && pricePaid && !isNaN(parseFloat(pricePaid)) && (
          <div className="calculation-preview">
            <div className="calc-item">
              <span>Points to be added:</span>
              <strong>{selectedBookData.point}</strong>
            </div>
            {parseFloat(pricePaid) > selectedBookData.price && (
              <div className="calc-item donation">
                <span>Donation:</span>
                <strong>+₹{(parseFloat(pricePaid) - selectedBookData.price).toFixed(2)}</strong>
              </div>
            )}
            {parseFloat(pricePaid) < selectedBookData.price && (
              <div className="calc-item loss">
                <span>Loss:</span>
                <strong>-₹{(selectedBookData.price - parseFloat(pricePaid)).toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Distribution'}
        </button>
      </form>
    </div>
  );
};

export default AddDistribution;

