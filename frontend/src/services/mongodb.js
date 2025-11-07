/**
 * MongoDB Atlas Data API Service
 * This service allows direct communication with MongoDB from the frontend
 * without needing a backend server.
 * 
 * Setup Instructions:
 * 1. Go to MongoDB Atlas (https://cloud.mongodb.com)
 * 2. Create a cluster (or use existing)
 * 3. Enable Data API in your Atlas project
 * 4. Create an API Key
 * 5. Get your App ID from Data API settings
 * 6. Set environment variables:
 *    REACT_APP_MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/XXXXX/endpoint/data/v1
 *    REACT_APP_MONGODB_API_KEY=your-api-key
 *    REACT_APP_MONGODB_CLUSTER=your-cluster-name
 *    REACT_APP_MONGODB_DATABASE=book-distribution
 */

const DATA_API_URL = process.env.REACT_APP_MONGODB_DATA_API_URL || '';
const API_KEY = process.env.REACT_APP_MONGODB_API_KEY || '';
const CLUSTER = process.env.REACT_APP_MONGODB_CLUSTER || '';
const DATABASE = process.env.REACT_APP_MONGODB_DATABASE || 'book-distribution';

// Helper function to normalize ObjectId format
function normalizeId(id) {
  if (!id) return null;
  if (typeof id === 'string') return id;
  if (id.$oid) return id.$oid;
  if (id._id?.$oid) return id._id.$oid;
  if (id._id) return id._id;
  return id;
}

// Helper function to convert string ID to ObjectId format for MongoDB Data API
function toObjectId(id) {
  if (!id) return null;
  const normalizedId = normalizeId(id);
  return { $oid: normalizedId };
}

// Helper function to normalize documents (convert ObjectIds to strings)
function normalizeDocument(doc) {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(normalizeDocument);
  }
  if (typeof doc !== 'object') return doc;
  
  const normalized = { ...doc };
  if (normalized._id) {
    normalized._id = normalizeId(normalized._id);
  }
  
  // Recursively normalize nested objects
  for (const key in normalized) {
    if (normalized[key] && typeof normalized[key] === 'object') {
      if (normalized[key].$oid) {
        normalized[key] = normalized[key].$oid;
      } else if (Array.isArray(normalized[key])) {
        normalized[key] = normalized[key].map(item => normalizeDocument(item));
      } else if (key !== '_id') {
        normalized[key] = normalizeDocument(normalized[key]);
      }
    }
  }
  
  return normalized;
}

// Helper function to make Data API requests
async function dataApiRequest(action, collection, filter = {}, document = {}, options = {}) {
  if (!DATA_API_URL || !API_KEY || !CLUSTER) {
    throw new Error('MongoDB Data API configuration is missing. Please set REACT_APP_MONGODB_DATA_API_URL, REACT_APP_MONGODB_API_KEY, and REACT_APP_MONGODB_CLUSTER environment variables.');
  }

  const url = `${DATA_API_URL}/action/${action}`;
  
  const payload = {
    dataSource: CLUSTER,
    database: DATABASE,
    collection: collection,
    ...(Object.keys(filter).length > 0 && { filter }),
    ...(Object.keys(document).length > 0 && { document }),
    ...(Object.keys(options).length > 0 && options)
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize ObjectIds in the response
    if (data.documents) {
      data.documents = data.documents.map(normalizeDocument);
    }
    if (data.document) {
      data.document = normalizeDocument(data.document);
    }
    
    return data;
  } catch (error) {
    console.error('MongoDB Data API Error:', error);
    throw error;
  }
}

// Books API
export const booksAPI = {
  getAll: async () => {
    const result = await dataApiRequest('find', 'books', {}, {}, { sort: { name: 1 } });
    return result.documents || [];
  },

  create: async (bookData) => {
    const result = await dataApiRequest('insertOne', 'books', {}, bookData);
    const insertedId = normalizeId(result.insertedId);
    return { _id: insertedId, ...bookData };
  }
};

// Centers API
export const centersAPI = {
  getAll: async () => {
    const result = await dataApiRequest('find', 'centers', {}, {}, { sort: { name: 1 } });
    return result.documents || [];
  },

  getById: async (id) => {
    const normalizedId = normalizeId(id);
    const result = await dataApiRequest('findOne', 'centers', { _id: toObjectId(normalizedId) });
    return result.document || null;
  },

  create: async (centerData) => {
    const result = await dataApiRequest('insertOne', 'centers', {}, centerData);
    const insertedId = normalizeId(result.insertedId);
    return { _id: insertedId, ...centerData };
  }
};

// Users API
export const usersAPI = {
  search: async (centerId, query = '') => {
    const normalizedCenterId = normalizeId(centerId);
    let filter = { center: toObjectId(normalizedCenterId) };
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { number: { $regex: query, $options: 'i' } }
      ];
    }

    const result = await dataApiRequest('find', 'users', filter, {}, { 
      sort: { name: 1 },
      limit: 20
    });
    return result.documents || [];
  },

  getById: async (id) => {
    const normalizedId = normalizeId(id);
    const user = await dataApiRequest('findOne', 'users', { _id: toObjectId(normalizedId) });
    if (!user.document) return null;

    // Populate center
    if (user.document.center) {
      const centerId = normalizeId(user.document.center);
      const center = await centersAPI.getById(centerId);
      user.document.center = center;
    }

    // Populate distributions.book
    if (user.document.distributions && user.document.distributions.length > 0) {
      const bookIds = user.document.distributions
        .map(d => normalizeId(d.book))
        .filter(Boolean);
      
      if (bookIds.length > 0) {
        const booksResult = await dataApiRequest('find', 'books', {
          _id: { $in: bookIds.map(id => toObjectId(id)) }
        });
        
        const books = booksResult.documents || [];
        const bookMap = {};
        books.forEach(book => {
          const bookId = normalizeId(book._id);
          bookMap[bookId] = book;
        });

        user.document.distributions = user.document.distributions.map(dist => ({
          ...dist,
          book: bookMap[normalizeId(dist.book)] || dist.book
        }));
      }
    }

    return user.document;
  },

  create: async (userData) => {
    const centerId = normalizeId(userData.centerId);
    // Check if user already exists
    const existing = await dataApiRequest('findOne', 'users', {
      number: userData.number,
      center: toObjectId(centerId)
    });

    if (existing.document) {
      // Return existing user
      const center = await centersAPI.getById(centerId);
      return { ...existing.document, center };
    }

    // Create new user
    const newUser = {
      name: userData.name,
      number: userData.number,
      center: toObjectId(centerId),
      points: 0,
      totalDonation: 0,
      totalLoss: 0,
      distributions: []
    };

    const result = await dataApiRequest('insertOne', 'users', {}, newUser);
    const center = await centersAPI.getById(centerId);
    const insertedId = normalizeId(result.insertedId);
    
    return { _id: insertedId, ...newUser, center };
  },

  addDistribution: async (userId, bookId, pricePaid) => {
    const normalizedUserId = normalizeId(userId);
    const normalizedBookId = normalizeId(bookId);
    
    // Get user, book, and center
    const userResult = await dataApiRequest('findOne', 'users', { _id: toObjectId(normalizedUserId) });
    const bookResult = await dataApiRequest('findOne', 'books', { _id: toObjectId(normalizedBookId) });
    
    if (!userResult.document || !bookResult.document) {
      throw new Error('User or book not found');
    }

    const user = userResult.document;
    const book = bookResult.document;
    const centerId = normalizeId(user.center);

    // Calculate donation and loss
    const bookPrice = book.price || 0;
    const donation = pricePaid > bookPrice ? pricePaid - bookPrice : 0;
    const loss = pricePaid < bookPrice ? bookPrice - pricePaid : 0;
    const points = book.point || 0;

    // Add distribution
    const newDistribution = {
      book: toObjectId(normalizedBookId),
      pricePaid: pricePaid,
      date: { $date: new Date().toISOString() }
    };

    // Update user
    const updatedUser = {
      ...user,
      distributions: [...(user.distributions || []), newDistribution],
      points: (user.points || 0) + points,
      totalDonation: (user.totalDonation || 0) + donation,
      totalLoss: (user.totalLoss || 0) + loss
    };

    await dataApiRequest('updateOne', 'users', 
      { _id: toObjectId(normalizedUserId) },
      { $set: {
        distributions: updatedUser.distributions,
        points: updatedUser.points,
        totalDonation: updatedUser.totalDonation,
        totalLoss: updatedUser.totalLoss
      }}
    );

    // Update center
    const centerResult = await dataApiRequest('findOne', 'centers', { _id: toObjectId(centerId) });
    if (centerResult.document) {
      const center = centerResult.document;
      await dataApiRequest('updateOne', 'centers',
        { _id: toObjectId(centerId) },
        { $set: {
          points: (center.points || 0) + points,
          donation: (center.donation || 0) + donation,
          loss: (center.loss || 0) + loss
        }}
      );
    }

    // Return populated user
    return await usersAPI.getById(normalizedUserId);
  },

  getAnalytics: async (userId) => {
    const normalizedUserId = normalizeId(userId);
    const user = await usersAPI.getById(normalizedUserId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate book-wise distribution
    const bookDistribution = {};
    
    (user.distributions || []).forEach(dist => {
      if (dist.book) {
        const bookId = normalizeId(dist.book._id || dist.book);
        if (!bookDistribution[bookId]) {
          bookDistribution[bookId] = {
            book: dist.book,
            count: 0
          };
        }
        bookDistribution[bookId].count += 1;
      }
    });

    return {
      user: {
        name: user.name,
        number: user.number,
        points: user.points || 0,
        totalDonation: user.totalDonation || 0,
        totalLoss: user.totalLoss || 0
      },
      bookDistribution: Object.values(bookDistribution),
      totalDistributions: (user.distributions || []).length
    };
  }
};

// Center Analytics API
export const centerAnalyticsAPI = {
  getAnalytics: async (centerId) => {
    const normalizedCenterId = normalizeId(centerId);
    const center = await centersAPI.getById(normalizedCenterId);
    if (!center) {
      throw new Error('Center not found');
    }

    // Get all users in this center
    const usersResult = await dataApiRequest('find', 'users', {
      center: toObjectId(normalizedCenterId)
    });
    const users = usersResult.documents || [];

    // Get all books
    const booksResult = await booksAPI.getAll();
    const books = booksResult;

    // Calculate book-wise analytics
    const bookAnalytics = {};
    
    users.forEach(user => {
      (user.distributions || []).forEach(dist => {
        if (dist.book) {
          const bookId = normalizeId(dist.book);
          const book = books.find(b => normalizeId(b._id) === bookId);
          
          if (book) {
            const bookIdStr = normalizeId(book._id);
            if (!bookAnalytics[bookIdStr]) {
              bookAnalytics[bookIdStr] = {
                book: book,
                count: 0,
                totalPrice: 0,
                totalPoints: 0,
                totalDonation: 0
              };
            }
            bookAnalytics[bookIdStr].count += 1;
            bookAnalytics[bookIdStr].totalPrice += dist.pricePaid || 0;
            bookAnalytics[bookIdStr].totalPoints += book.point || 0;
            
            const donation = (dist.pricePaid || 0) - (book.price || 0);
            if (donation > 0) {
              bookAnalytics[bookIdStr].totalDonation += donation;
            }
          }
        }
      });
    });

    return {
      center: center,
      bookAnalytics: Object.values(bookAnalytics),
      totalUsers: users.length
    };
  }
};

