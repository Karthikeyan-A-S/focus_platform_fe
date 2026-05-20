import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Helper to generate the headers containing the token
export const getAuthHeaders = (token) => {
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Also configure a base axios instance (optional, but good practice if needed)
export const api = axios.create({
  baseURL: API_BASE_URL
});

export default API_BASE_URL;