import axios from 'axios';
import keycloak from './keycloak';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const setupApiInterceptors = () => {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;

  const requestInterceptor = async (config: any) => {
    if (keycloak.authenticated && keycloak.token) {
      try {
        await keycloak.updateToken(30);
      } catch (e) {
        console.warn('Failed to refresh Keycloak token before request', e);
      }
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  };

  axios.interceptors.request.use(requestInterceptor);
  api.interceptors.request.use(requestInterceptor);
};

export default api;
