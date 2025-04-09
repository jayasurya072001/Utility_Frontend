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

export const runFileModelTest = async (model, version, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", model);
    formData.append("version", version);
 
    const response = await axios.post(`${API_BASE_URL}/utility/file-upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
 
    return response.data.predictions;
  } catch (error) {
    console.error("Error running File Model Test:", error);
    return { error: "Failed to process request" };
  }
};

export const analysisCardHandleChange = async (chunk, inputMediaUrl) => {
  return await axios.post("http://localhost:5000/utilities/analysis/unset-analysis", {
    "chunk": chunk,
    "inputMediaUrl": localData['inputMediaUrl']
})
}

export const proofValidation = async (data) => {
  return await axios.post("http://localhost:5000/utilities/analysis/proof-validation", data,
    {
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.data)
}

export const setNotBug = async (chunk, inputMediaUrl) => {
  return await axios.post("http://localhost:5000/utilities/analysis/set-notbug", {
      "chunk": chunk,
      "inputMediaUrl": inputMediaUrl
  })
}

export const setOutlier = async (chunk, inputMediaUrl) => {
  return await axios.post("http://localhost:5000/utilities/analysis/set-outlier", {
      "chunk": chunk,
      "inputMediaUrl": inputMediaUrl
  })
}

export const getExpectedClasses = async (model) => {
  return await axios.get(`http://localhost:5000/utilities/analysis/get-model-classes/${model}`)
    .then(response => response.data)
}

export const getThreshold = async () => {
  return await axios.get("http://localhost:5000/utilities/analysis/get-threshold")
    .then(response => response.data)
}

export const getExpectedScore = async () => {
  return await axios.get("http://localhost:5000/utilities/dynamic-test/get-expected-score")
  .then(response => response.data)
}

export const getChunkData = async (chunk) => {
  return await axios.get(`http://localhost:5000/utilities/analysis/get-chunk/${chunk}`)
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching chunk:", error)
    })
}

export const getChunks = async () => {
  return await axios.get("http://localhost:5000/utilities/analysis/get-chunks")
    .then(response => response.data)
}

export const getModelClasses = async (model) => {
  return await axios.get(`http://localhost:5000/utilities/analysis/get-model-classes/${model.toLowerCase()}`)
    .then(response => response.data)
}

export const getAllAnalysts = async () => {
  return await axios.get(`http://localhost:5000/utilities/analysis/get-all-analysts`)
    .then(response => response.data)
}

export const canMerge = async () => {
  return await axios.get("http://localhost:5000/utilities/analysis/can-merge")
    .then(response => response.data)
}

export const initiateMerge = async () => {
  return await axios.get("http://localhost:5000/utilities/analysis/merge")
    .then(response => response.data)
}

export const getSelectedModel = async () => {
  return await axios.get("http://localhost:5000/utilities/analysis/get-selected-model")
    .then(response => response.data)
}

export const getAllVersions = async (model) => {
  return await axios.get(`http://localhost:5000/utilities/dynamic-test/all-versions/${model}`)
    .then(response => response.data)
}

export const getRegressionReady = async () => {
  return await axios.get("http://localhost:5000/utilities/regression-test/get-regression-ready")
    .then(response => response.data)
}

export const initiateRegressionTest = async (data = {}) => {
  return await axios.post('http://localhost:5000/utilities/regression-test/run', data)
    .then(response => response.data)
}

export const getSelectedVersion = async () => {
  return axios.get(`http://localhost:5000/utilities/dynamic-test/get-selected-version`)
    .then(res => res.data)
}

export const getRegressionModel = async () => {
  return await axios.get("http://localhost:5000/utilities/regression-test/get-regression-model")
    .then(response => response.data)
}