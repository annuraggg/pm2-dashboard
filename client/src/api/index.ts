import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const fetchApps = () => api.get('/apps');
export const restartApp = (name: string) => api.post(`/apps/${name}/restart`);
export const fetchLogs = (name: string) => api.get(`/apps/${name}/logs`);
export const fetchDeployScript = (name: string) => api.get(`/apps/${name}/deploy-script`);
export const updateDeployScript = (name: string, script: string) =>
  api.post(`/apps/${name}/deploy-script`, { script });
export const deployApp = (name: string) => api.post(`/apps/${name}/deploy`);

export const fetchUsers = () => api.get('/admin/users');
export const addUser = (username: string, passwordHash: string) =>
  api.post('/admin/users', { username, passwordHash });
export const fetchLogsAdmin = () => api.get('/admin/logs');

export default api;
