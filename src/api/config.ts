import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';

export const API_BASE_URL_DEV = 'http://localhost:3300';
export const API_BASE_URL_PROD = 'https://r8u2hn9ej3.execute-api.eu-west-3.amazonaws.com';
const api = axios.create({
  baseURL: API_BASE_URL_PROD,
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
