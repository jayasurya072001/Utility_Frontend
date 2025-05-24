import axios from "axios";

const API_HOST = "http://48.217.82.89:5147/"; // Update this as per your backend URL

const api = axios.create({
  baseURL: API_HOST,
  timeout: 10000,
});

export const fetchAllModelsStatus = () => api.get("vm/models/stats");

export default api;
