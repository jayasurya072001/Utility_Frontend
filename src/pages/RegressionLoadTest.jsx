import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  Button,
  Card,
  Typography,
  notification,
  Space,
  Divider,
  Tag,
  Spin,
  Row,
  Col,
  Switch,
  Slider,
  InputNumber,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  Empty,
  List,
  Progress,
  Statistic,
  Modal,
  Upload,
  message,
  Alert,
} from "antd";
import {
  Send,
  Cpu,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Settings,
  Activity,
  Info,
  FileText,
  Calendar,
  HardDrive,
  BarChart2,
  Server,
  RefreshCw,
  Eye,
  Link as LinkIcon,
  Image,
  UserPlus,
  Repeat,
  UploadCloud,
  PlusCircle,
} from "lucide-react";
import axios from "axios";
import "./RegressionLoadTest.css";
import ModelsDropdown from "../components/ModelsDropdown";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// Enhanced model version map with more details
const modelVersionMap = {
  nudity: {
    versions: ["v23", "v22", "v21"],
    description: "Content moderation for explicit imagery",
    icon: <AlertCircle size={16} />,
  },
  violence: {
    versions: ["v11", "v10"],
    description: "Detection of violent or harmful content",
    icon: <AlertCircle size={16} />,
  },
  hate_speech: {
    versions: ["v8", "v7", "v6"],
    description: "Analysis of text for harmful language",
    icon: <FileText size={16} />,
  },
  misinformation: {
    versions: ["v4", "v3"],
    description: "Fact-checking and misinformation detection",
    icon: <Info size={16} />,
  },
};

const statusIcons = {
  "CSV file loaded": <HardDrive size={16} color="#aaa" />,
  "CSV processing started": <Activity size={16} color="#aaa" />,
  "Performing regression check": <Cpu size={16} color="#aaa" />,
  "Current progress": <Activity size={16} color="#aaa" />,
  "Regression process completed": <BarChart2 size={16} color="#aaa" />,
  "Saving results": <Server size={16} color="#aaa" />,
};

const statusOrder = [
  "CSV file loaded",
  "CSV processing started",
  "Performing regression check",
  "Current progress",
  "Regression process completed",
  "Saving results",
  "Error",
];

// API endpoints
const API_BASE_URL = "http://localhost:5000";

// Add this helper function at the top of your component
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No timestamp";

  try {
    // Check if it's in the format YYYYMMDD_HHMMSS
    if (/^\d{8}_\d{6}$/.test(timestamp)) {
      const formatted = timestamp.replace(
        /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/,
        "$1-$2-$3T$4:$5:$6"
      );
      return new Date(formatted).toLocaleString();
    }

    // Try direct parsing
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }

    // If all else fails, return the raw timestamp
    return timestamp;
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return timestamp;
  }
};

export default function RegressionLoadTest() {
  // Add state to track sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Other state variables remain the same

  // Check sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(savedCollapsedState === "true");
    }

    // Add event listener to detect changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === "sidebarCollapsed") {
        setSidebarCollapsed(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Calculate the left margin based on sidebar state
  const sidebarWidth = sidebarCollapsed ? 80 : 250;

  // Core state
  const [model, setModel] = useState();
  const [version, setVersion] = useState(null);
  const [filename, setFilename] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusDetails, setStatusDetails] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visibleStatus, setVisibleStatus] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // New features state
  const [recentTasks, setRecentTasks] = useState([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.75);
  const [autoStop, setAutoStop] = useState(true);
  const [resultsData, setResultsData] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchSize, setBatchSize] = useState(100);

  // Add new state for CSV files
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Add state for file upload modal
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuggestion, setUploadSuggestion] = useState(null);

  // Fetch available CSV files when model changes
  useEffect(() => {
    if (model) {
      fetchAvailableFiles(model);
    }
  }, [model]);

  // Function to fetch available CSV files for the selected model
  const fetchAvailableFiles = async (modelName) => {
    setIsLoadingFiles(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/utilities/regression-test/input-files?model=${modelName}`
      );
      if (response.data && response.data.files) {
        setAvailableFiles(response.data.files);
        // Auto-select the first file if available
        if (response.data.files.length > 0) {
          setFilename(response.data.files[0].filename);
        } else {
          setFilename("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch available files", err);
      notification.error({
        message: "Agent JASU",
        description: "Failed to retrieve available CSV files",
        icon: <X size={16} color="#ff4d4f" />,
      });
      setAvailableFiles([]);
      setFilename("");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Fetch task history from API on component mount and when drawer opens
  const fetchTaskHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/utilities/regression-test/tasks`
      );
      if (response.data && response.data.tasks) {
        setRecentTasks(response.data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch task history", err);
      notification.error({
        message: "Agent JASU",
        description: "Failed to retrieve task history",
        icon: <X size={16} color="#ff4d4f" />,
      });
    } finally {
      setIsHistoryLoading(false);
    }
  }, [API_BASE_URL]);

  // Load task history when component mounts
  useEffect(() => {
    fetchTaskHistory();
  }, [fetchTaskHistory]);

  // Refresh history when drawer opens
  useEffect(() => {
    if (historyDrawerOpen) {
      fetchTaskHistory();
    }
  }, [historyDrawerOpen, fetchTaskHistory]);

  const stopPollingAndReset = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsProcessing(false);
    notification.info({
      message: "Agent JASU",
      description: "Polling stopped and results cleared",
      icon: <CheckCircle size={16} color="#1890ff" />,
    });
  }, [intervalId]);

  const startTask = async () => {
    if (!filename) {
      notification.warning({
        message: "Agent JASU",
        description: "Please select a CSV file to process",
        icon: <AlertCircle size={16} color="#faad14" />,
      });
      return;
    }

    setIsProcessing(true);
    setVisibleStatus([]);
    setStatus(null);
    setStatusDetails(null);
    setResultsData(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/utilities/regression-test/start`,
        {
          model,
          version,
          input_filename: filename,
          threshold: threshold,
          batch_size: batchSize,
        }
      );

      const id = response.data.task_id;
      setTaskId(id);

      notification.success({
        message: "Agent JASU",
        description: `Task initiated with ID: ${id}`,
        icon: <Cpu size={16} color="#52c41a" />,
      });

      const poll = setInterval(() => checkStatus(id), 2000);
      setIntervalId(poll);

      // Refresh task history after starting a new task
      setTimeout(fetchTaskHistory, 1000);
    } catch (err) {
      setIsProcessing(false);
      notification.error({
        message: "Agent JASU",
        description: "Failed to initialize task sequence",
        icon: <X size={16} color="#ff4d4f" />,
      });
    }
  };

  const checkStatus = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/utilities/regression-test/status/${id}`
      );
      const responseData = response.data;

      // Update state with new API response format
      setStatus(responseData.status);
      setStatusDetails(responseData.details);

      // Update visible status items based on completion
      const newVisibleStatus = [...visibleStatus];
      statusOrder.forEach((key) => {
        if (
          responseData.details[key] !== undefined &&
          !newVisibleStatus.includes(key)
        ) {
          newVisibleStatus.push(key);
        }
      });
      setVisibleStatus(newVisibleStatus);

      // Update task status in recent tasks
      setRecentTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: responseData.status,
              }
            : task
        )
      );

      // Show completion notification and fetch results when completed
      if (
        responseData.status === "completed" &&
        !responseData.details["Error"]
      ) {
        notification.success({
          message: "Agent JASU",
          description:
            "Analysis completed successfully! Click 'Stop & Reset' to clear",
          icon: <CheckCircle size={16} color="#52c41a" />,
        });

        // Fetch results data
        try {
          const resultsResponse = await axios.get(
            `${API_BASE_URL}/results/${id}`
          );
          console.log("Results data:", resultsResponse.data);
          setResultsData(resultsResponse.data);
        } catch (err) {
          console.error("Failed to fetch results data", err);
          notification.error({
            message: "Agent JASU",
            description: "Failed to fetch results data",
            icon: <X size={16} color="#ff4d4f" />,
          });
        }

        // Auto-stop if enabled
        if (autoStop) {
          clearInterval(intervalId);
          setIntervalId(null);
          setIsProcessing(false);
        }
      }
    } catch (err) {
      notification.error({
        message: "Agent JASU",
        description: "Connection to neural processor interrupted",
        icon: <X size={16} color="#ff4d4f" />,
      });
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const renderStatusItem = (key) => {
    if (!visibleStatus.includes(key) || !statusDetails) return null;

    const value = statusDetails[key];
    const isCompleted = value === true;
    const isInProgress = value === false;
    const isError = key === "Error" && value;
    const isProgress = key === "Current progress";

    // Don't show Error if it's null or undefined
    if (key === "Error" && (value === null || value === undefined)) {
      return null;
    }

    return (
      <div key={key} className="status-item">
        <div className="status-label">
          <span className="status-icon">
            {statusIcons[key] ||
              (isError ? (
                <AlertCircle size={16} color="#ff4d4f" />
              ) : (
                <Clock size={16} color="#aaa" />
              ))}
          </span>
          <Text style={{ color: "#ddd" }}>{key}</Text>
        </div>
        <div className="status-value">
          {isProgress && typeof value === "string" ? (
            <Tag color="blue">{value}</Tag>
          ) : isInProgress ? (
            <Spin size="small" />
          ) : isCompleted ? (
            <CheckCircle size={20} color="#52c41a" />
          ) : (
            <Tag color={isError ? "red" : "blue"}>{String(value)}</Tag>
          )}
        </div>
      </div>
    );
  };

  const loadTaskFromHistory = (task) => {
    setModel(task.model);
    setVersion(task.version);
    setTaskId(task.task_id);
    setHistoryDrawerOpen(false);

    // Fetch status first to get details
    axios
      .get(`${API_BASE_URL}/utilities/regression-test/status/${task.task_id}`)
      .then((statusResponse) => {
        setStatus(statusResponse.data.status);
        setStatusDetails(statusResponse.data.details);

        // Update visible status items
        const newVisibleStatus = [];
        statusOrder.forEach((key) => {
          if (statusResponse.data.details[key] !== undefined) {
            newVisibleStatus.push(key);
          }
        });
        setVisibleStatus(newVisibleStatus);

        // Then fetch results
        return axios.get(
          `${API_BASE_URL}/utilities/regression-test/results/${task.task_id}`
        );
      })
      .then((resultsResponse) => {
        console.log("Historical results:", resultsResponse.data);
        setResultsData(resultsResponse.data);
      })
      .catch((err) => {
        console.error("Failed to fetch historical data", err);
        notification.warning({
          message: "Agent JASU",
          description: "Could not retrieve historical results",
          icon: <AlertCircle size={16} color="#faad14" />,
        });
      });
  };

  const downloadResults = () => {
    if (!resultsData) {
      notification.warning({
        message: "Agent JASU",
        description: "No results data available to download",
        icon: <AlertCircle size={16} color="#faad14" />,
      });
      return;
    }

    // If we have task ID and output filename, download the CSV file
    if (taskId && statusDetails?.output_filename) {
      downloadOutputFile(taskId);
    } else {
      // Fallback to JSON download if no CSV is available
      const dataStr = JSON.stringify(resultsData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileDefaultName = `regression-results-${taskId}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      notification.info({
        message: "Agent JASU",
        description: "Downloaded results as JSON (CSV not available)",
        icon: <Info size={16} color="#1890ff" />,
      });
    }
  };

  // Add this useEffect to debug resultsData
  useEffect(() => {
    if (resultsData) {
      console.log("Results data updated:", resultsData);
    }
  }, [resultsData]);

  // Add a function to download the output CSV file
  const downloadOutputFile = async (taskId) => {
    if (!taskId || !statusDetails?.output_filename) {
      notification.warning({
        message: "Agent JASU",
        description: "No output file available to download",
        icon: <AlertCircle size={16} color="#faad14" />,
      });
      return;
    }

    try {
      // Use axios to get the file with responseType blob
      const response = await axios.get(
        `${API_BASE_URL}/utilities/regression-test/download/${taskId}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = statusDetails.output_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Agent JASU",
        description: `Downloaded ${statusDetails.output_filename} successfully`,
        icon: <CheckCircle size={16} color="#52c41a" />,
      });
    } catch (error) {
      console.error("Download error:", error);
      notification.error({
        message: "Agent JASU",
        description: "Failed to download output file",
        icon: <X size={16} color="#ff4d4f" />,
      });
    }
  };

  const renderFileSelector = () => (
    <Col xs={24} md={24} lg={24} xl={24}>
      <div className="input-label">Input Dataset</div>
      <Select
        placeholder={isLoadingFiles ? "Loading files..." : "Select CSV file"}
        value={filename}
        onChange={setFilename}
        className="agent-input"
        disabled={isProcessing || isLoadingFiles}
        size="large"
        loading={isLoadingFiles}
        style={{ width: "100%" }}
        suffixIcon={<FileText size={16} color="#aaa" />}
        optionLabelProp="label"
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: "8px 0", borderColor: "#333" }} />
            <div
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: "#1890ff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => setUploadModalVisible(true)}
            >
              <PlusCircle size={16} />
              <span>Add CSV File</span>
            </div>
          </>
        )}
      >
        {availableFiles.map((file) => (
          <Select.Option
            key={file.filename}
            value={file.filename}
            label={file.filename}
          >
            <Tooltip
              title={
                <div>
                  <p>
                    <strong>Rows:</strong> {file.row_count}
                  </p>
                  <p>
                    <strong>Size:</strong> {file.size}
                  </p>
                  <p>
                    <strong>Modified:</strong>{" "}
                    {new Date(file.modified).toLocaleString()}
                  </p>
                </div>
              }
              placement="right"
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{file.filename}</span>
                <span style={{ color: "#aaa", fontSize: "12px" }}>
                  {file.row_count} rows | {file.size}
                </span>
              </div>
            </Tooltip>
          </Select.Option>
        ))}
      </Select>

      {/* File Upload Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <UploadCloud size={20} />
            <span style={{ color: "black" }}>Upload CSV File</span>
          </div>
        }
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileToUpload(null);
          setUploadError(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setUploadModalVisible(false);
              setFileToUpload(null);
              setUploadError(null);
            }}
            style={{
              background: "#1f1f1f",
              borderColor: "#ff4d4f",
              color: "#ff4d4f",
            }}
            icon={<X size={16} />}
          >
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploadLoading}
            onClick={handleFileUpload}
            disabled={!fileToUpload}
            style={{ marginLeft: "8px" }}
          >
            {uploadLoading ? "Uploading..." : "Upload"}
          </Button>,
        ]}
        width={500}
        bodyStyle={{
          background: "#1a1a1a",
          padding: "20px",
          borderRadius: "4px",
        }}
        style={{
          top: 20,
        }}
        maskStyle={{ background: "rgba(0, 0, 0, 0.7)" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {uploadError && (
            <Alert
              message="Upload Error"
              description={
                <div>
                  <p>{uploadError}</p>
                  {uploadSuggestion && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontStyle: "italic",
                        color: "#ffa39e",
                      }}
                    >
                      <strong>Suggestion:</strong> {uploadSuggestion}
                    </p>
                  )}
                </div>
              }
              type="error"
              showIcon
              style={{
                marginBottom: "16px",
                background: "#2a1215",
                border: "1px solid #5c2021",
              }}
            />
          )}

          <Upload.Dragger
            name="file"
            multiple={false}
            showUploadList={true}
            beforeUpload={() => false}
            onChange={handleFileSelect}
            onRemove={() => {
              console.log("File explicitly removed by user");
              setFileToUpload(null);
            }}
            accept=".csv"
            maxCount={1}
            style={{
              background: "#141414",
              border: "1px dashed #333",
              borderRadius: "4px",
              padding: "20px",
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadCloud size={40} color="#1890ff" />
            </p>
            <p className="ant-upload-text" style={{ color: "#fff" }}>
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ color: "#aaa" }}>
              File must be a valid CSV for the {model} model
            </p>
            <p
              className="ant-upload-hint"
              style={{ color: "#aaa", fontSize: "12px", marginTop: "8px" }}
            >
              Naming format: regression_test_[optional_version]_{model}.csv
            </p>
          </Upload.Dragger>

          {fileToUpload && (
            <div style={{ marginTop: "16px" }}>
              <Text type="secondary" style={{ color: "#aaa" }}>
                Selected file:{" "}
                <Text strong style={{ color: "#1890ff" }}>
                  {fileToUpload.name}
                </Text>{" "}
                ({(fileToUpload.size / 1024).toFixed(2)} KB)
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </Col>
  );

  // Function to handle file upload
  const handleFileUpload = async () => {
    console.log("Upload button clicked, file:", fileToUpload);

    if (!fileToUpload) {
      console.error("No file to upload");
      setUploadError("Please select a CSV file to upload");
      setUploadSuggestion("Choose a CSV file before uploading");
      return;
    }

    if (!model) {
      console.error("No model selected");
      setUploadError("Model selection is required");
      setUploadSuggestion("Please select a model before uploading");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuggestion(null);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("model", model);

    console.log("Uploading file:", fileToUpload.name, "for model:", model);

    try {
      console.log(
        "Sending request to:",
        `${API_BASE_URL}/utilities/regression-test/upload-csv`
      );

      const response = await axios.post(
        `${API_BASE_URL}/utilities/regression-test/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response.data);

      // Handle successful response
      notification.success({
        message: "Agent JASU",
        description: response.data.message || "CSV file uploaded successfully",
        icon: <CheckCircle size={16} color="#52c41a" />,
      });

      // Close modal and refresh file list
      setUploadModalVisible(false);
      setFileToUpload(null);
      fetchAvailableFiles(model);
    } catch (err) {
      console.error("Upload error:", err);

      if (err.response) {
        console.error(
          "Error response:",
          err.response.status,
          err.response.data
        );
      }

      // Handle error response in the specific format
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        setUploadError(errorData.error || "Failed to upload file");

        if (errorData.suggestion) {
          setUploadSuggestion(errorData.suggestion);
        }
      } else {
        setUploadError("Network error. Please try again.");
        setUploadSuggestion("Check your internet connection and try again.");
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Function to handle file selection
  const handleFileSelect = (info) => {
    console.log("Upload info received:", info);

    // Check the file status
    if (info.file.status === "removed") {
      console.log("File was removed");
      setFileToUpload(null);
      return;
    }

    // In Ant Design Upload, the file is in info.file or info.file.originFileObj
    const file = info.file.originFileObj || info.file;

    // Make sure we have a file object
    if (!file) {
      console.error("No file object found in the upload info");
      return;
    }

    // Check if it's a File object with the necessary properties
    if (!(file instanceof File) && !file.name) {
      console.error("Invalid file object:", file);
      return;
    }

    // Validate file type
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      console.error("Invalid file type:", file.type, file.name);
      setUploadError("Only CSV files are supported");
      setUploadSuggestion("Please select a file with .csv extension");
      setFileToUpload(null);
      return;
    }

    console.log("File selected successfully:", file.name, file.size);
    setFileToUpload(file);
    setUploadError(null);
    setUploadSuggestion(null);
  };

  // Add a useEffect to log when fileToUpload changes
  useEffect(() => {
    console.log(
      "fileToUpload state updated:",
      fileToUpload ? fileToUpload.name : "null"
    );
  }, [fileToUpload]);

  return (
    <div
      className="regression-container"
      style={{
        marginLeft: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        transition: "margin-left 0.2s, width 0.2s",
      }}
    >
      <Row
        gutter={[24, 24]}
        justify="space-around"
        style={{ width: "100%", margin: 0 }}
      >
        <Col xs={10} lg={12} xl={14} xxl={16} style={{ padding: 0 }}>
          <Card
            className="regression-card"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #333",
              boxShadow: "0 0 20px rgba(0, 150, 255, 0.2)",
              width: "100%",
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div className="card-header">
              <div className="flex items-center mb-6">
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: "#1890ff",
                    marginRight: 16,
                  }}
                  icon={<Cpu size={24} />}
                />
                <div>
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    Agent JASU
                  </Title>
                  <Text type="secondary" style={{ color: "#aaa" }}>
                    Regression Analysis System
                  </Text>
                </div>
                <div className="header-actions">
                  <Tooltip title="View Task History">
                    <Button
                      type="text"
                      icon={<Clock size={18} color="#aaa" />}
                      onClick={() => setHistoryDrawerOpen(true)}
                      style={{ color: "#aaa" }}
                    />
                  </Tooltip>
                  <Tooltip title="Advanced Settings">
                    <Button
                      type="text"
                      icon={<Settings size={18} color="#aaa" />}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      style={{ color: "#aaa" }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>

            <Divider style={{ borderColor: "#333" }} />

            {/* Model, Version and Input Dataset section */}
            <Row gutter={[16, 16]} className="mb-4" style={{ width: "100%" }}>
              <Col xs={24} md={24} lg={24} xl={24} style={{ width: "100%" }}>
                <div className="input-label">Model & Version</div>
                <ModelsDropdown
                  selectedModel={model}
                  selectedVersion={version}
                  onModelChange={setModel}
                  onVersionChange={setVersion}
                  disabled={isProcessing}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Col>

              {renderFileSelector()}
            </Row>

            {showAdvanced && (
              <div className="advanced-settings">
                <Divider
                  orientation="left"
                  style={{ borderColor: "#333", color: "#aaa" }}
                >
                  Advanced Settings
                </Divider>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <div className="input-label">Confidence Threshold</div>
                    <div className="slider-container">
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={threshold}
                        onChange={(e) =>
                          setThreshold(parseFloat(e.target.value))
                        }
                        className="agent-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="input-label">Batch Size</div>
                    <Input
                      type="number"
                      min={10}
                      max={1000}
                      step={10}
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      className="agent-input"
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="input-label">Auto-Stop on Completion</div>
                    <Switch
                      checked={autoStop}
                      onChange={setAutoStop}
                      checkedChildren="Enabled"
                      unCheckedChildren="Disabled"
                    />
                  </Col>
                </Row>
              </div>
            )}

            <div className="action-buttons">
              <Button
                className="action-button primary"
                type="primary"
                size="large"
                icon={<Send size={18} color="#fff" />}
                onClick={startTask}
                loading={isProcessing}
                disabled={!filename}
              >
                INITIATE ANALYSIS
              </Button>

              <Button
                className="action-button secondary"
                type="default"
                size="large"
                icon={<X size={18} />}
                onClick={stopPollingAndReset}
                disabled={!isProcessing}
              >
                STOP & RESET
              </Button>

              {resultsData && (
                <Button
                  className="action-button download"
                  type="default"
                  size="large"
                  icon={<Download size={18} color="#fff" />}
                  onClick={downloadResults}
                >
                  DOWNLOAD RESULTS
                </Button>
              )}
            </div>

            {taskId && (
              <div className="task-id-container">
                <Text strong style={{ color: "#1890ff" }}>
                  TASK ID: <Tag color="blue">{taskId}</Tag>
                </Text>
                {statusDetails && statusDetails.start_time && (
                  <Text style={{ color: "#aaa", marginLeft: 16 }}>
                    <Clock
                      size={14}
                      style={{ marginRight: 4, verticalAlign: "middle" }}
                    />
                    Started:{" "}
                    {new Date(statusDetails.start_time).toLocaleString()}
                  </Text>
                )}
              </div>
            )}

            {statusDetails && (
              <div className="status-container">
                <Divider
                  orientation="left"
                  style={{ borderColor: "#333", color: "#aaa" }}
                >
                  PROCESS STATUS
                  {status && (
                    <Tag
                      color={
                        status === "completed"
                          ? "success"
                          : status === "running"
                          ? "processing"
                          : status === "error"
                          ? "error"
                          : "default"
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {status.toUpperCase()}
                    </Tag>
                  )}
                </Divider>

                <Row gutter={[16, 16]}>
                  {/* First column of status items */}
                  <Col xs={24} md={12}>
                    {statusOrder
                      .filter(
                        (key) => key !== "Current progress" && key !== "Error"
                      )
                      .slice(0, Math.ceil((statusOrder.length - 2) / 2))
                      .map((key) => renderStatusItem(key))}
                  </Col>

                  {/* Second column of status items */}
                  <Col xs={24} md={12}>
                    {statusOrder
                      .filter(
                        (key) => key !== "Current progress" && key !== "Error"
                      )
                      .slice(Math.ceil((statusOrder.length - 2) / 2))
                      .map((key) => renderStatusItem(key))}

                    {/* Error status (if present) */}
                    {renderStatusItem("Error")}
                  </Col>

                  {/* Current progress spanning full width */}
                  {visibleStatus.includes("Current progress") &&
                    statusDetails && (
                      <Col xs={24}>
                        <div className="progress-status-item">
                          <div className="status-label">
                            <span className="status-icon">
                              {statusIcons["Current progress"]}
                            </span>
                            <Text style={{ color: "#ddd" }}>
                              Current progress
                            </Text>
                          </div>
                          <div className="progress-bar-container">
                            <Progress
                              percent={parseInt(
                                statusDetails?.["Current progress"]?.replace(
                                  "%",
                                  ""
                                ) || "0"
                              )}
                              status="active"
                              strokeColor={{
                                "0%": "#108ee9",
                                "100%": "#87d068",
                              }}
                            />
                          </div>
                        </div>
                      </Col>
                    )}
                </Row>

                {/* Additional metadata from the new API response */}
                {statusDetails && (
                  <div className="metadata-container">
                    <Divider
                      orientation="left"
                      style={{ borderColor: "#333", color: "#aaa" }}
                    >
                      Process Metadata
                    </Divider>
                    <Row gutter={[12, 12]}>
                      {statusDetails.start_time && (
                        <Col xs={24} sm={12} md={6}>
                          <Card
                            className="metadata-card"
                            style={{ height: "100%" }}
                          >
                            <Statistic
                              value={new Date(
                                statusDetails.start_time
                              ).toLocaleTimeString()}
                              prefix={<Calendar size={16} />}
                              valueStyle={{ color: "#1890ff" }}
                            />
                          </Card>
                        </Col>
                      )}
                      {statusDetails.end_time && (
                        <Col xs={24} sm={12} md={6}>
                          <Card
                            className="metadata-card"
                            style={{ height: "100%" }}
                          >
                            <Statistic
                              value={new Date(
                                statusDetails.end_time
                              ).toLocaleTimeString()}
                              prefix={<Calendar size={16} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                      )}
                      {statusDetails.start_time && statusDetails.end_time && (
                        <Col xs={24} sm={12} md={6}>
                          <Card
                            className="metadata-card"
                            style={{ height: "100%" }}
                          >
                            <Statistic
                              value={Math.round(
                                (new Date(statusDetails.end_time) -
                                  new Date(statusDetails.start_time)) /
                                  1000
                              )}
                              suffix="sec"
                              prefix={<Clock size={16} />}
                              valueStyle={{ color: "#722ed1" }}
                            />
                          </Card>
                        </Col>
                      )}
                      {statusDetails.csv_path && (
                        <Col xs={24} sm={12} md={6}>
                          <Card
                            className="metadata-card"
                            style={{ height: "100%" }}
                          >
                            <Statistic
                              value={statusDetails.csv_path.split("/").pop()}
                              prefix={<FileText size={16} />}
                              valueStyle={{ color: "#faad14" }}
                              formatter={(value) => (
                                <Tooltip title={statusDetails.csv_path}>
                                  <span style={{ wordBreak: "break-all" }}>
                                    {value}
                                  </span>
                                </Tooltip>
                              )}
                            />
                          </Card>
                        </Col>
                      )}
                    </Row>

                    {/* Add a second row for output filename */}
                    {statusDetails.output_filename && (
                      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                        <Col xs={24}>
                          <Card className="metadata-card">
                            <Statistic
                              value={statusDetails.output_filename}
                              prefix={<FileText size={16} />}
                              valueStyle={{ color: "#1890ff" }}
                              formatter={(value) => (
                                <Tooltip title={statusDetails.csv_path}>
                                  <span style={{ wordBreak: "break-all" }}>
                                    {value}
                                  </span>
                                </Tooltip>
                              )}
                            />
                            <Button
                              type="link"
                              icon={<Download size={14} />}
                              style={{ marginTop: "8px", padding: 0 }}
                              onClick={() => downloadOutputFile(taskId)}
                            >
                              Download Output File
                            </Button>
                          </Card>
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
              </div>
            )}

            {isProcessing && !statusDetails && (
              <div className="initializing-container">
                <Space size="middle">
                  <Progress
                    type="circle"
                    percent={75}
                    status="active"
                    width={80}
                  />
                  <div>
                    <Title level={5} style={{ color: "white" }}>
                      Initializing Model Regression Processor
                    </Title>
                    <Text type="secondary" style={{ color: "#aaa" }}>
                      Connecting to regression analysis modules...
                    </Text>
                  </div>
                </Space>
              </div>
            )}

            {resultsData && (
              <div className="results-container">
                <Divider
                  orientation="left"
                  style={{ borderColor: "#333", color: "#aaa" }}
                >
                  ANALYSIS RESULTS
                </Divider>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                      <Statistic
                        title="Total Samples"
                        value={resultsData.total_count || 0}
                        prefix={<FileText size={16} />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                      <Statistic
                        title="Fixed Issues"
                        value={resultsData.fixed_count || 0}
                        prefix={<CheckCircle size={16} />}
                        valueStyle={{ color: "#52c41a" }}
                        suffix={
                          resultsData.total_count > 0
                            ? `(${Math.round(
                                (resultsData.fixed_count /
                                  resultsData.total_count) *
                                  100
                              )}%)`
                            : ""
                        }
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                      <Statistic
                        title="Not Fixed"
                        value={resultsData.not_fixed_count || 0}
                        prefix={<AlertCircle size={16} />}
                        valueStyle={{ color: "#faad14" }}
                        suffix={
                          resultsData.total_count
                            ? `(${Math.round(
                                (resultsData.not_fixed_count /
                                  resultsData.total_count) *
                                  100
                              )}%)`
                            : ""
                        }
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                      <Statistic
                        title="Regressed Issues"
                        value={resultsData.regressed_count || 0}
                        prefix={<X size={16} />}
                        valueStyle={{
                          color:
                            resultsData.regressed_count > 0
                              ? "#ff4d4f"
                              : "#52c41a",
                        }}
                        suffix={
                          resultsData.total_count && resultsData.regressed_count
                            ? `(${Math.round(
                                (resultsData.regressed_count /
                                  resultsData.total_count) *
                                  100
                              )}%)`
                            : ""
                        }
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Add a visual representation of the results */}
                <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                  <Col xs={24}>
                    <Card className="results-chart-card">
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          strong
                          style={{ color: "#fff", fontSize: "16px" }}
                        >
                          Results Distribution
                        </Text>
                      </div>
                      <div className="results-progress-bars">
                        <div className="progress-item">
                          <div className="progress-label">
                            <Text style={{ color: "#52c41a" }}>
                              Fixed Issues
                            </Text>
                            <Text style={{ color: "#52c41a" }}>
                              {resultsData.fixed_count || 0}
                            </Text>
                          </div>
                          <Progress
                            percent={
                              resultsData.total_count
                                ? Math.round(
                                    (resultsData.fixed_count /
                                      resultsData.total_count) *
                                      100
                                  )
                                : 0
                            }
                            strokeColor="#52c41a"
                            showInfo={false}
                          />
                        </div>
                        <div className="progress-item">
                          <div className="progress-label">
                            <Text style={{ color: "#faad14" }}>Not Fixed</Text>
                            <Text style={{ color: "#faad14" }}>
                              {resultsData.not_fixed_count || 0}
                            </Text>
                          </div>
                          <Progress
                            percent={
                              resultsData.total_count
                                ? Math.round(
                                    (resultsData.not_fixed_count /
                                      resultsData.total_count) *
                                      100
                                  )
                                : 0
                            }
                            strokeColor="#faad14"
                            showInfo={false}
                          />
                        </div>
                        <div className="progress-item">
                          <div className="progress-label">
                            <Text style={{ color: "#ff4d4f" }}>Regressed</Text>
                            <Text style={{ color: "#ff4d4f" }}>
                              {resultsData.regressed_count || 0}
                            </Text>
                          </div>
                          <Progress
                            percent={
                              resultsData.total_count
                                ? Math.round(
                                    (resultsData.regressed_count /
                                      resultsData.total_count) *
                                      100
                                  )
                                : 0
                            }
                            strokeColor="#ff4d4f"
                            showInfo={false}
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#fff" }}>Task History</span>
            <Space>
              <Button
                type="text"
                icon={<RefreshCw size={16} />}
                onClick={fetchTaskHistory}
                loading={isHistoryLoading}
                style={{ color: "#aaa" }}
              />
            </Space>
          </div>
        }
        placement="right"
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
        width={400}
        headerStyle={{
          borderBottom: "1px solid #333",
          backgroundColor: "#1a1a1a",
          color: "#fff",
        }}
        bodyStyle={{
          backgroundColor: "#111",
          padding: 0,
        }}
        closeIcon={<X size={18} color="#aaa" />}
        drawerStyle={{
          backgroundColor: "#111",
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
        footer={
          <div
            style={{
              textAlign: "right",
              backgroundColor: "#1a1a1a",
              padding: "10px 16px",
              borderTop: "1px solid #333",
            }}
          >
            {/* <Button
              onClick={() => setHistoryDrawerOpen(false)}
              style={{
                backgroundColor: "#1f1f1f",
                borderColor: "#333",
                color: "#fff",
              }}
              icon={<X size={16} />}
            >
              Close
            </Button> */}
          </div>
        }
      >
        {isHistoryLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
            }}
          >
            <Spin size="large" />
          </div>
        ) : recentTasks.length > 0 ? (
          <List
            dataSource={recentTasks}
            renderItem={(task) => (
              <List.Item
                key={task.task_id}
                onClick={() => loadTaskFromHistory(task)}
                className="history-item"
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      status={
                        task.status === "completed"
                          ? "success"
                          : task.status === "error" || task.error
                          ? "error"
                          : "processing"
                      }
                    />
                  }
                  title={
                    <Text style={{ color: "#fff" }}>
                      {task.model.toUpperCase()} - {task.version}
                    </Text>
                  }
                  description={
                    <div>
                      {task.task_id && (
                        <Text style={{ color: "#aaa" }} ellipsis>
                          {task.task_id}
                        </Text>
                      )}
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatTimestamp(task.timestamp)}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        {task.status && (
                          <Tag
                            color={
                              task.status === "completed"
                                ? "success"
                                : task.status === "error"
                                ? "error"
                                : "processing"
                            }
                            style={{ marginRight: 8 }}
                          >
                            {task.status.toUpperCase()}
                          </Tag>
                        )}
                        {task.progress && (
                          <Tag color="blue">{task.progress}</Tag>
                        )}
                      </div>
                    </div>
                  }
                />
                <Button
                  type="text"
                  icon={<Eye size={16} color="#1890ff" />}
                  style={{ color: "#1890ff" }}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: "#aaa" }}>No task history found</Text>
            }
            style={{ margin: "40px 0" }}
          />
        )}
      </Drawer>
    </div>
  );
}
