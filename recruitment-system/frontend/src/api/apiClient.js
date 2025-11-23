import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false
});

client.interceptors.request.use(config => {
  const s = localStorage.getItem('auth');
  if (s) {
    const { accessToken } = JSON.parse(s);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default client;
