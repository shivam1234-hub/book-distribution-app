import axios from 'axios';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Backend URLs configuration
// For local development, use localhost. For production, use deployed backends.
let BACKEND_URLS;

if (isDevelopment) {
  // Local development - use local backend
  const localBackendUrl = process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:8083/api';
  BACKEND_URLS = [localBackendUrl];
} else {
  // Production - use deployed backends
  // GET requests: called in parallel (race for speed)
  // Write requests (POST/PUT/DELETE): called sequentially (prevents duplicates)
  BACKEND_URLS = [
    process.env.REACT_APP_API_URL_VERCEL || 'https://book-distribution-app.vercel.app/api',
    process.env.REACT_APP_API_URL_RENDER || 'https://book-distribution-app.onrender.com/api'
  ];
}

/**
 * Makes parallel requests to both backends and returns the first successful response
 * Uses Promise.race for speed, but tracks all requests for fallback
 * SAFE FOR READ-ONLY OPERATIONS (GET requests)
 * @param {Function} requestFn - Function that takes a baseURL and returns a promise
 * @returns {Promise} - The first successful response
 */
async function raceRequests(requestFn) {
  let firstSuccess = null;
  let firstError = null;
  const errors = [];
  
  // Create promises that resolve/reject but track results
  const requests = BACKEND_URLS.map((baseURL, index) => {
    const promise = requestFn(baseURL)
      .then(response => {
        if (!firstSuccess) {
          firstSuccess = response;
          console.log(`✓ Backend ${index + 1} (${baseURL}) responded first`);
        }
        return response;
      })
      .catch(error => {
        if (!firstError) {
          firstError = error;
        }
        errors.push({ baseURL, error });
        console.log(`✗ Backend ${index + 1} (${baseURL}) failed:`, error.message);
        throw error;
      });
    return promise;
  });

  // Race all requests - first to succeed wins
  try {
    // Use Promise.race to get the first response (success or failure)
    // But we'll handle failures by checking if any succeeded
    const winner = await Promise.race(requests);
    return winner;
  } catch (raceError) {
    // If the race winner failed, check if any other request succeeded
    // Wait a bit for other requests to complete
    const results = await Promise.allSettled(requests);
    
    // Find first successful response
    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    }
    
    // All failed - throw first error
    throw firstError || raceError || new Error('All backends failed');
  }
}

/**
 * Makes sequential requests to backends, trying one at a time
 * SAFE FOR WRITE OPERATIONS (POST, PUT, DELETE) - prevents duplicate writes
 * @param {Function} requestFn - Function that takes a baseURL and returns a promise
 * @returns {Promise} - The first successful response
 */
async function sequentialRequests(requestFn) {
  let lastError = null;
  
  // Try each backend sequentially - stop at first success
  for (let index = 0; index < BACKEND_URLS.length; index++) {
    const baseURL = BACKEND_URLS[index];
    try {
      const response = await requestFn(baseURL);
      console.log(`✓ Backend ${index + 1} (${baseURL}) succeeded`);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`✗ Backend ${index + 1} (${baseURL}) failed:`, error.message);
      // Continue to next backend if this one failed
    }
  }
  
  // All backends failed
  throw lastError || new Error('All backends failed');
}

/**
 * API service with parallel request support
 */
const api = {
  /**
   * GET request
   */
  get: async (endpoint, config = {}) => {
    return raceRequests(baseURL => 
      axios.get(`${baseURL}${endpoint}`, {
        ...config,
        timeout: 10000 // 10 second timeout per request
      })
    );
  },

  /**
   * POST request - uses sequential requests to prevent duplicate writes
   */
  post: async (endpoint, data = {}, config = {}) => {
    return sequentialRequests(baseURL => 
      axios.post(`${baseURL}${endpoint}`, data, {
        ...config,
        timeout: 10000
      })
    );
  },

  /**
   * PUT request - uses sequential requests to prevent duplicate writes
   */
  put: async (endpoint, data = {}, config = {}) => {
    return sequentialRequests(baseURL => 
      axios.put(`${baseURL}${endpoint}`, data, {
        ...config,
        timeout: 10000
      })
    );
  },

  /**
   * DELETE request - uses sequential requests to prevent duplicate writes
   */
  delete: async (endpoint, config = {}) => {
    return sequentialRequests(baseURL => 
      axios.delete(`${baseURL}${endpoint}`, {
        ...config,
        timeout: 10000
      })
    );
  }
};

export default api;

