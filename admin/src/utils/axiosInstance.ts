// src/utils/axiosInstance.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  // add other fields if needed
}

const axiosJWT = axios.create();

axiosJWT.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) return config;

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const now = Date.now();

    if (decoded.exp * 1000 < now) {
      try {
        const res = await axios.post('/api/auth/refresh', { token: refreshToken });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        config.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
      } catch (err) {
        console.error('Token refresh failed:', err);
        // optionally clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/admin/login';
        return Promise.reject(err);
      }
    } else {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosJWT;
