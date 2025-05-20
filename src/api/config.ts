import axios, { AxiosRequestHeaders } from 'axios';
import { handleApiError } from '../utils/errorHandling';
import { fetchAuthSession } from 'aws-amplify/auth';

export const API_BASE_URL_DEV = 'http://localhost:3300';
export const API_BASE_URL_PROD = 'https://7hogl4xayc.execute-api.us-east-1.amazonaws.com/dev';
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL_PROD,
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Intercepteur pour injecter dynamiquement le token JWT d'Amplify v6 dans chaque requête
api.interceptors.request.use(
  async config => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.idToken?.toString();
      if (accessToken) {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders;
        (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
        console.log('Headers:', config.headers);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error(errorMessage);
      return Promise.reject(error);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = handleApiError(error);
    console.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
