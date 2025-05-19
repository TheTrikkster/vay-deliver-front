import axios, { AxiosRequestHeaders } from 'axios';
import { handleApiError } from '../utils/errorHandling';
import { fetchAuthSession } from 'aws-amplify/auth';

export const API_BASE_URL_DEV = 'https://bvgxoado1l.execute-api.us-east-1.amazonaws.com/';
export const API_BASE_URL_PROD = 'https://bvgxoado1l.execute-api.us-east-1.amazonaws.com/';
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
      const accessToken = session.tokens?.accessToken?.toString();
      console.log('AccessToken:', accessToken);
      if (accessToken) {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders;
        (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
        console.log('Headers:', config.headers);
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
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // qui est en dehors de la plage 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Request error:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
