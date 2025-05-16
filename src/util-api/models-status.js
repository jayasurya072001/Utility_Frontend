import axios from 'axios';

const API_HOST = 'http://localhost:5001'; // Update this as per your backend URL

const api = axios.create({
  baseURL: API_HOST,
  timeout: 10000
});

export const fetchVmStatus = () => api.get('/vms/status');

export const fetchVmScaleStatus = () => api.get('/vms/scale');

export const fetchVmsCount = () => api.get('/vms');

export default api;
