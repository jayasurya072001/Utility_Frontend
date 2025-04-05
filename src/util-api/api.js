import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const fetchModels = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/utility/models`);
//     console.log(response)
//     return response.data.models;
//   } catch (error) {
//     console.error("Error fetching models:", error);
//     return {};
//   }
// };

export const fetchModels = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/utilities/dynamic-test/all-models`);
    console.log(response.data);

    return response.data
  } catch(error) {
    console.error("Error fetching model", error);
    return {}
  }
}

export const startProcess = async (version, model, recipients) => {

  const data = { version, model, recipients }
  try {
    const response = await axios.post(`http://localhost:5000/utilities/dynamic-test/start-process`, data)

    return response
  } catch (error) {
    if (error.response && error.response.status === 409 || error.response.status == 400) {
      console.warn("Process already exists or cannot be started.");
      return { status: error.response.status, data: error.response.data }; // Handle it gracefully
    }
    console.error("Cannot Start Process", error);
    return { status: error.response?.status || 500, data: {} }; // Return the status if available
  }
}

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

