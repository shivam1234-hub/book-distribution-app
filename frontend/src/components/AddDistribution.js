import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AddDistribution.css';

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

const AddDistribution = ({ user, onDistributionAdded, onBookAdded }) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [books, setBooks] = useState([]);
  const [newBookType, setNewBookType] = useState('');
  const [newBookLanguage, setNewBookLanguage] = useState('');
  const [newBookName, setNewBookName] = useState('');
  const [newBookPoint, setNewBookPoint] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');

  const fetchBooksByTypeAndLanguage = async () => {
    try {
      let url = '/books?';
      if (selectedType) {
        url += `type=${selectedType}`;
      }
      if (selectedLanguage) {
        url += selectedType ? `&language=${selectedLanguage}` : `language=${selectedLanguage}`;
      }
      const response = await api.get(url);
      setBooks(response.data);
      setSelectedBook(''); // Reset selected book when filters change
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    }
  };

  useEffect(() => {
    if (selectedType && selectedLanguage) {
      fetchBooksByTypeAndLanguage();
    } else {
      setBooks([]);
      setSelectedBook('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedLanguage]);

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
      await api.post(`/users/${user._id}/distribution`, {
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
    if (!newBookType || !newBookLanguage || !newBookName.trim() || !newBookPrice) {
      alert('Please enter book type, language, name, and price');
      return;
    }

    // Get points from the type mapping
    const point = BOOK_TYPE_POINTS[newBookType];
    const price = parseFloat(newBookPrice);
    
    if (point === undefined || isNaN(price) || price < 0) {
      alert('Please enter valid book type and price');
      return;
    }

    try {
      await api.post('/books', {
        type: newBookType,
        language: newBookLanguage,
        name: newBookName.trim(),
        point: point,
        price: price
      });
      setNewBookType('');
      setNewBookLanguage('');
      setNewBookName('');
      setNewBookPoint('');
      setNewBookPrice('');
      setShowAddBook(false);
      alert('Book added successfully!');
      // Refresh books for the current type and language
      if (selectedType && selectedLanguage) {
        await fetchBooksByTypeAndLanguage();
      }
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
          <label htmlFor="type-select">Select Book Type:</label>
          <button 
            type="button"
            onClick={() => {
              setShowAddBook(!showAddBook);
              if (!showAddBook) {
                setNewBookType('');
                setNewBookLanguage('');
                setNewBookName('');
                setNewBookPoint('');
                setNewBookPrice('');
              }
            }}
            className="btn-add-book"
          >
            {showAddBook ? '✕ Cancel' : '+ Add Book'}
          </button>
        </div>

        {showAddBook && (
          <div className="add-book-form">
            <form onSubmit={handleAddBook}>
              <select
                value={newBookType}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  setNewBookType(selectedType);
                  // Auto-fill points based on type
                  if (selectedType && BOOK_TYPE_POINTS[selectedType] !== undefined) {
                    setNewBookPoint(BOOK_TYPE_POINTS[selectedType].toString());
                  } else {
                    setNewBookPoint('');
                  }
                }}
                className="form-select"
                required
              >
                <option value="">-- Select Book Type --</option>
                {BOOK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={newBookLanguage}
                onChange={(e) => setNewBookLanguage(e.target.value)}
                className="form-select"
                required
                disabled={!newBookType}
              >
                <option value="">-- Select Language --</option>
                {BOOK_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Book Name"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                className="form-input"
                disabled={!newBookType || !newBookLanguage}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Points (Auto-filled)"
                value={newBookPoint}
                readOnly
                className="form-input"
                disabled={!newBookType || !newBookLanguage}
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price (₹)"
                value={newBookPrice}
                onChange={(e) => setNewBookPrice(e.target.value)}
                className="form-input"
                disabled={!newBookType || !newBookLanguage}
              />
              <button type="submit" className="btn-primary" disabled={!newBookType || !newBookLanguage}>Add Book</button>
            </form>
          </div>
        )}

        <select
          id="type-select"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedLanguage(''); // Reset language when type changes
          }}
          className="form-select"
        >
          <option value="">-- Select Book Type First --</option>
          {BOOK_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {selectedType && (
          <>
            <label htmlFor="language-select" style={{ marginTop: '15px', display: 'block' }}>Select Language:</label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="form-select"
            >
              <option value="">-- Select Language --</option>
              {BOOK_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </>
        )}

        {selectedType && selectedLanguage && (
          <>
            <label htmlFor="book-select" style={{ marginTop: '15px', display: 'block' }}>Select Book:</label>
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
            {books.length === 0 && (
              <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
                No books found for this type and language. Add a new book above.
              </p>
            )}
          </>
        )}
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

