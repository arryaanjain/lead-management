// src/utils/axiosJWT.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../types/token';

const axiosJWT = axios.create();

axiosJWT.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('clientAccessToken');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        localStorage.removeItem('clientAccessToken');
        window.location.href = '/';
        return Promise.reject('Session expired. Redirecting...');
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosJWT;
