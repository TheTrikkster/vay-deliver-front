import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';

export const API_BASE_URL_DEV = 'http://localhost:3300';
export const API_BASE_URL_PROD = 'https://api.example.com';
const api = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteurs pour gérer les erreurs globalement
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = handleApiError(error);
    console.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
