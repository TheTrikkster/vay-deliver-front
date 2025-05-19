import axios, { AxiosRequestHeaders } from 'axios';
import { handleApiError } from '../utils/errorHandling';
import { fetchAuthSession } from 'aws-amplify/auth';

export const API_BASE_URL_DEV = 'http://localhost:3300';
export const API_BASE_URL_PROD = 'https://r8u2hn9ej3.execute-api.eu-west-3.amazonaws.com/';
const api = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter dynamiquement le token JWT d'Amplify v6 dans chaque requête
api.interceptors.request.use(
  async config => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      console.log(idToken);
      if (idToken) {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders;
        (config.headers as any)['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (error) {
      // Pas d'utilisateur connecté ou erreur de récupération du token
      console.log(error);
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
