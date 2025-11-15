import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './StockManagement.css';

const BOOK_TYPES = [
  { value: 'MB', label: 'MB - Mega Big' },
  { value: 'B', label: 'B - Big' },
  { value: 'M', label: 'M - Medium' },
  { value: 'S', label: 'S - Small' },
  { value: 'SB', label: 'SB - Srimad Bhagavatam' },
  { value: 'CC', label: 'CC - Chaitanya Charita Mrita' }
];

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

const StockManagement = ({ center }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [quantity, setQuantity] = useState('');
  const [books, setBooks] = useState([]);
  const [addingStock, setAddingStock] = useState(false);

  useEffect(() => {
    fetchStockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/centers/${center._id}/stock`);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      alert('Error fetching stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      setSelectedBook('');
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

  const handleAddStock = async (e) => {
    e.preventDefault();
    
    if (!selectedBook || !quantity) {
      alert('Please select a book and enter quantity');
      return;
    }

    const qty = parseInt(quantity);

    if (isNaN(qty) || qty < 1) {
      alert('Please enter a valid quantity (at least 1)');
      return;
    }

    const selectedBookData = books.find(b => b._id === selectedBook);
    if (!selectedBookData) {
      alert('Please select a valid book');
      return;
    }

    // Calculate cost automatically: book price * quantity
    const costPaid = selectedBookData.price * qty;

    setAddingStock(true);
    try {
      await api.post(`/centers/${center._id}/stock`, {
        bookId: selectedBook,
        quantity: qty,
        costPaid: costPaid
      });
      
      setSelectedBook('');
      setQuantity('');
      setShowAddStock(false);
      alert('Stock added successfully!');
      fetchStockData();
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock. Please try again.');
    } finally {
      setAddingStock(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return <div className="stock-management loading">Loading stock data...</div>;
  }

  if (!stockData) {
    return <div className="stock-management">No stock data available.</div>;
  }

  return (
    <div className="stock-management">
      <div className="stock-header">
        <h2>📦 Stock Management - {stockData.center.name}</h2>
        <button
          onClick={() => {
            setShowAddStock(!showAddStock);
            if (showAddStock) {
              setSelectedType('');
              setSelectedLanguage('');
              setSelectedBook('');
              setQuantity('');
            }
          }}
          className="btn-add-stock"
        >
          {showAddStock ? '✕ Cancel' : '+ Add Stock'}
        </button>
      </div>

      {showAddStock && (
        <div className="add-stock-form-container">
          <form onSubmit={handleAddStock} className="add-stock-form">
            <h3>Add Books to Stock</h3>
            
            <div className="form-group">
              <label>Book Type:</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedLanguage('');
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
            </div>

            {selectedType && (
              <div className="form-group">
                <label>Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Language --</option>
                  {BOOK_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedType && selectedLanguage && (
              <div className="form-group">
                <label>Book:</label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Book --</option>
                  {books.map(book => (
                    <option key={book._id} value={book._id}>
                      {book.name} - Price: ₹{book.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedBook && (
              <>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-input"
                    placeholder="Number of books"
                    required
                  />
                </div>

                {quantity && !isNaN(parseInt(quantity)) && parseInt(quantity) > 0 && (
                  <div className="cost-preview">
                    <div className="cost-preview-item">
                      <span>Book Price:</span>
                      <strong>₹{books.find(b => b._id === selectedBook)?.price || 0}</strong>
                    </div>
                    <div className="cost-preview-item">
                      <span>Quantity:</span>
                      <strong>{quantity}</strong>
                    </div>
                    <div className="cost-preview-item total">
                      <span>Total Cost (Auto-calculated):</span>
                      <strong>₹{(books.find(b => b._id === selectedBook)?.price || 0) * parseInt(quantity)}</strong>
                    </div>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="submit-btn" disabled={addingStock || !selectedBook}>
              {addingStock ? 'Adding...' : 'Add Stock'}
            </button>
          </form>
        </div>
      )}

      <div className="financial-summary">
        <h3>💰 Financial Summary</h3>
        <div className="summary-cards">
          <div className="summary-card cost">
            <div className="card-label"> Payment to Temple</div>
            <div className="card-value">{formatCurrency(stockData.totals.totalCostPaid)}</div>
          </div>
          <div className="summary-card revenue">
            <div className="card-label">Total Distribution</div>
            <div className="card-value">{formatCurrency(stockData.totals.totalRevenue)}</div>
          </div>
          <div className={`summary-card ${stockData.totals.netProfit >= 0 ? 'profit' : 'loss'}`}>
            <div className="card-label">To Collect</div>
            <div className="card-value">
              {stockData.totals.netProfit >= 0 ? '+' : ''}{formatCurrency(stockData.totals.netProfit)}
            </div>
          </div>
        </div>
      </div>

      <div className="stock-sections">
        <div className="stock-section">
          <h3>📚 Current Stock</h3>
          {stockData.currentStock.length === 0 ? (
            <p className="no-data">No stock data available.</p>
          ) : (
            <div className="table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Book Name</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Stock Added</th>
                    <th>Distributed</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.currentStock.map((item, index) => (
                    <tr key={index}>
                      <td>{item.book.name}</td>
                      <td>{item.book.type}</td>
                      <td>{item.book.language}</td>
                      <td>{item.stockAdded}</td>
                      <td>{item.distributed}</td>
                      <td className={item.remaining < 0 ? 'negative' : ''}>
                        {item.remaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stock-section">
          <h3>📤 Distributed Books</h3>
          {stockData.distributedBooks.length === 0 ? (
            <p className="no-data">No books distributed yet.</p>
          ) : (
            <div className="table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Book Name</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Quantity</th>
                    <th>Total Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.distributedBooks.map((item, index) => (
                    <tr key={index}>
                      <td>{item.book.name}</td>
                      <td>{item.book.type}</td>
                      <td>{item.book.language}</td>
                      <td>{item.count}</td>
                      <td>{formatCurrency(item.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stock-section">
          <h3>📦 Stock History (Recent Entries)</h3>
          {stockData.recentStockEntries.length === 0 ? (
            <p className="no-data">No stock entries yet.</p>
          ) : (
            <div className="table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Book Name</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Quantity</th>
                    <th>Cost Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.recentStockEntries.map((entry, index) => (
                    <tr key={index}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.book.name}</td>
                      <td>{entry.book.type}</td>
                      <td>{entry.book.language}</td>
                      <td>{entry.quantity}</td>
                      <td>{formatCurrency(entry.costPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;

