import axios from "axios";

// Base URL for models API
const MODELS_API_BASE_URL = "http://localhost:5000/utilities/models";

// Get all available models and versions
export const fetchAvailableModels = async () => {
  try {
    const response = await axios.get(`${MODELS_API_BASE_URL}/available`);
    return response.data;
  } catch (error) {
    console.error("Error fetching available models:", error);
    throw error;
  }
};

// Refresh models cache in backend
export const refreshModelsCache = async () => {
  try {
    const response = await axios.get(`${MODELS_API_BASE_URL}/refresh`);
    return response.data;
  } catch (error) {
    console.error("Error refreshing models cache:", error);
    throw error;
  }
};
