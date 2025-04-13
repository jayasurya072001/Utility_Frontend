import axios from "axios";

const API_BASE_URL = 'http://localhost:5000';

// Utility function for handling API errors
const handleApiError = (error, customMessage = "API request failed") => {
  console.error(customMessage, error);
  if (error.response) {
    return { status: error.response.status, data: error.response.data };
  }
  return { status: 500, data: { message: "Network error or server unavailable." } };
};

// Utility function to create axios instances with optional authorization
const createApiInstance = (withAuth = false) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Example timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (withAuth) {
        const token = sessionStorage.getItem('authToken'); // Assuming you store your token here
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return instance;
};

// API instance without authorization
const publicApi = createApiInstance();

// API instance with authorization
const privateApi = createApiInstance(true);

// API instance for multipart form data (e.g., file uploads)
const formDataApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

formDataApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

formDataApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const fetchModels = async () => {
  try {
    const response = await privateApi.get(`/utilities/dynamic-test/all-models`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching models");
  }
};

export const startProcess = async (version, model, recipients, expectedScore) => {
  const data = { version, model, recipients, expectedScore };
  console.log("Data", data)
  try {
    const response = await privateApi.post(`/utilities/dynamic-test/start-process`, data);
    return response;
  } catch (error) {
    if (error.response && (error.response.status === 409 || error.response.status === 400)) {
      console.warn("Process already exists or cannot be started.");
      return { status: error.response.status, data: error.response.data };
    }
    return handleApiError(error, "Cannot Start Process");
  }
};

export const runUrlModelTest = async (model, version, imageUrl) => {
  try {
    const response = await privateApi.post(`/utilities/prediction/url-upload`, {
      model,
      version,
      inputMediaUrl: imageUrl,
    });
    return response.data.predictions;
  } catch (error) {``
    return handleApiError(error, "Error running URL Model Test");
  }
};

export const runFileModelTest = async (formData) => {
  try {
    const response = await formDataApi.post(`/utilities/prediction/file-upload`, formData);
    const predictions = response?.data?.predictions
    console.log(predictions)
    return predictions;
  } catch (error) {
    return handleApiError(error, "Error running File Model Test");
  }
};

export const analysisCardHandleChange = async (chunk, inputMediaUrl) => {
  try {
    const response = await privateApi.post("/utilities/analysis/unset-analysis", {
      chunk: chunk,
      inputMediaUrl: inputMediaUrl // Assuming localData is accessible in this scope
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error handling analysis card change");
  }
};

export const proofValidation = async (data) => {
  try {
    const response = await privateApi.post("/utilities/analysis/proof-validation", data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error during proof validation");
  }
};

export const setNotBug = async (chunk, inputMediaUrl) => {
  try {
    const response = await privateApi.post("/utilities/analysis/set-notbug", {
      chunk: chunk,
      inputMediaUrl: inputMediaUrl
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error setting not bug");
  }
};

export const setOutlier = async (chunk, inputMediaUrl) => {
  try {
    const response = await privateApi.post("/utilities/analysis/set-outlier", {
      chunk: chunk,
      inputMediaUrl: inputMediaUrl
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error setting outlier");
  }
};

export const getExpectedClasses = async (model) => {
  try {
    const response = await privateApi.get(`/utilities/analysis/get-model-classes/${model}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching expected classes");
  }
};

export const getThreshold = async () => {
  try {
    const response = await privateApi.get("/utilities/analysis/get-threshold");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching threshold");
  }
};

export const getExpectedScore = async () => {
  try {
    const response = await privateApi.get("/utilities/dynamic-test/get-expected-score");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching expected score");
  }
};

export const getChunkData = async (chunk, inputMediaUrl) => {
  if(chunk && inputMediaUrl){
    try {
      const response = await privateApi.get(`/utilities/analysis/get-chunk/${chunk}?inputMediaUrl=${inputMediaUrl}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error fetching chunk: ${chunk}`);
    }
  } else if(chunk){
    try{
      const response = await privateApi.get(`/utilities/analysis/get-chunk/${chunk}`)
      return response.data;
    } catch(error) {
      return handleApiError(error, `Error fetching chunk: ${chunk}`);
    }
  } else {
    return {"error": "insufficient information", "status": 400}
  }
};

export const getChunks = async () => {
  try {
    const response = await privateApi.get("/utilities/analysis/get-chunks");
    return response
  } catch (error) {
    return handleApiError(error, "Error fetching chunks");
  }
};

export const getModelClasses = async (model) => {
  try {
    const response = await privateApi.get(`/utilities/analysis/get-model-classes/${model.toLowerCase()}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Error fetching classes for model: ${model}`);
  }
};

export const getAllAnalysts = async () => {
  try {
    const response = await privateApi.get(`/utilities/analysis/get-analysts`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching all analysts");
  }
};

export const setAnalyst = async (analyst, chunk) => {
  if(analyst && chunk) {
    try {
      const response = await privateApi.post('/utilities/analysis/set-analyst', {
        analyst, chunk
      })
      return response
    } catch(error) {
      return handleApiError(error, "Error while setting analyst")
    }
  }
}

export const canMerge = async () => {
  try {
    const response = await privateApi.get("/utilities/analysis/can-merge");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error checking if merge is possible");
  }
};

export const initiateMerge = async () => {
  try {
    const response = await privateApi.get("/utilities/analysis/merge");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error initiating merge");
  }
};

export const getSelectedModel = async () => {
  try {
    const response = await privateApi.get("/utilities/analysis/get-selected-model");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching selected model");
  }
};

export const getAllVersions = async (model) => {
  try {
    const response = await privateApi.get(`/utilities/dynamic-test/all-versions/${model}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Error fetching versions for model: ${model}`);
  }
};

export const getRegressionReady = async () => {
  try {
    const response = await privateApi.get("/utilities/regression-test/get-regression-ready");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching regression ready status");
  }
};

export const initiateRegressionTest = async (data = {}) => {
  try {
    const response = await privateApi.post('/utilities/regression-test/run', data);
    return response;
  } catch (error) {
    return handleApiError(error, "Error initiating regression test");
  }
};

export const getSelectedVersion = async () => {
  try {
    const response = await privateApi.get(`/utilities/dynamic-test/get-selected-version`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching selected version");
  }
};

export const getRegressionModel = async () => {
  try {
    const response = await privateApi.get("/utilities/regression-test/get-regression-model");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching regression model");
  }
};

export const login = async (empid, password) => {
  try {
    const body = {
      emp_id: empid,
      password, password
    }
    const response = await publicApi.post("/utilities/auth/login", body)

    console.log("Login Response", response)

    const { token } = response.data

    return { "authToken": token };
  } catch(error) {
    return handleApiError(error, "Cannot Log In");
  }
};

export const register = async ({ emp_id, full_name, password, privilege }) => {
  if(emp_id && full_name && password && privilege){
    try {
      const body = { emp_id, full_name, password, privilege }

      return await privateApi.post('/utilities/auth/register', body)
    } catch(error) {
      return handleApiError(error, "Cannot Register")
    }
  }
}

export const generateImageUrl = async (image) => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const response = await formDataApi.post(`/utilities/generate-image-url`, formData);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error Uploading Image");
  }
};