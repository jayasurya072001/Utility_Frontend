import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/utility/models`);
    print(response)
    return response.data.models;
  } catch (error) {
    console.error("Error fetching models:", error);
    return {};
  }
};

export const runUrlModelTest = async (model, version, imageUrl) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/utility/url-upload`, {
      model,
      version,
      image_url: imageUrl,
    });
    return response.data.predictions;
  } catch (error) {
    console.error("Error running URL Model Test:", error);
    return { error: "Failed to process request" };
  }
};
