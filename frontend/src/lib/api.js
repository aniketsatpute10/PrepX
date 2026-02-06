import axios from 'axios';
import { useAuth } from '../state/AuthContext';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export function attachToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// React hook for API with auth attached
export function useApi() {
  const { token } = useAuth();

  if (token) {
    attachToken(token);
  } else {
    attachToken(null);
  }

  return apiClient;
}

