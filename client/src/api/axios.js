import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Retry configuration
const retryConfig = {
  maxRetries: 3,
  retryDelay: (retryCount) => {
    return Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
  }
};

// Track retry attempts per request
let retryAttempts = {};

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and retries
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 429 (Too Many Requests) with retry
    if (error.response?.status === 429) {
      const requestId = `${config.method}-${config.url}`;
      retryAttempts[requestId] = (retryAttempts[requestId] || 0) + 1;

      if (retryAttempts[requestId] <= retryConfig.maxRetries) {
        const delay = retryConfig.retryDelay(retryAttempts[requestId] - 1);
        console.warn(
          `Rate limited. Retrying in ${delay}ms (attempt ${retryAttempts[requestId]}/${retryConfig.maxRetries})`,
          config.url
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return API(config).finally(() => {
          delete retryAttempts[requestId]; // Clean up
        });
      } else {
        console.error('Max retries exceeded for rate-limited request:', config.url);
        return Promise.reject(error);
      }
    }

    // Clean up retry attempts on other errors
    const requestId = `${config.method}-${config.url}`;
    delete retryAttempts[requestId];

    return Promise.reject(error);
  }
);

export default API;