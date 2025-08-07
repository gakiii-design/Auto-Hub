// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:5000';

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
