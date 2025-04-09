import React, { useEffect, useState, version } from "react";
import { Select, Upload, Button, Card, message, Divider, Row, Col } from "antd";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";
import axios, { all } from "axios";

import { fetchModels, getAllVersions, getRegressionModel, getRegressionReady, getSelectedVersion, initiateRegressionTest } from "../util-api/api";
import toast from "react-hot-toast";

const { Option } = Select;
const { Dragger } = Upload;

const RegressionLoadTest = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [models, setModels] = useState([])
  const [modelVersions, setModelVersions] = useState("")
  const [regressionReady, setRegressionReady] = useState(false)

  // const models = ["Model A", "Model B", "Model C"];
  // const versions = { 
  //   "Model A": ["v1.0", "v1.1"], 
  //   "Model B": ["v2.0"], 
  //   "Model C": ["v3.0", "v3.1"] 
  // };

  useEffect(() => {
    const init = async () => {
      const response = await getRegressionReady()

      console.log("Regression Ready", response["regression-ready"])
      setRegressionReady(response["regression-ready"])
    }

    init()
  }, [axios, setRegressionReady])


  const handleFileChange = (info) => {
    const { file } = info;
    if (!file.name.endsWith(".csv")) {
      message.error("Only CSV files are allowed!");
      return;
    }
    setFile(file);
    message.success(`${file.name} uploaded successfully`);
  };

  const handleSubmit = async () => {
    if (!selectedModel || !selectedVersion) {
      message.error("Please select a model, version, and upload a CSV file.");
      return;
    }
    
    // setIsProcessing(true);
    // message.loading({ content: "Processing your file...", key: "upload" });
    
    // setTimeout(() => {
    //   setIsProcessing(false);
    //   message.success({ content: "Analysis complete!", key: "upload", duration: 3 });
    // }, 2000);

    try {
      const response = await initiateRegressionTest({model: selectedModel, version: selectedVersion})
      console.log('Request successful:', response);
      toast.success(response?.message)
      return response; // or whatever you want to return
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
  
        if (error.response.status === 409 || error.response.status === 500) {
          // Handle 409 Conflict error specifically
          console.error('Conflict (409) error occurred:', error.response.data);
          toast.error(error.response.data?.error)
          //Example of how to handle the data that came back.
          if (error.response.data.message) {
            console.error(error.response.data.message);
          }
  
          // Perform specific actions for 409 errors (e.g., show a message to the user)
          throw new Error('Conflict occurred. Please try again.'); // or return a specific error code
        } else {
          // Handle other error codes
          console.error('Other error occurred:', error);
          throw error; // Re-throw the error to be handled elsewhere
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('No response received:', error.request);
        throw new Error('No response received from the server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error('Error setting up the request.');
      }
    }
    
  };

  useEffect(() => {
      const init = async () => {
          setModels(await fetchModels())
      }
      init()
  }, [fetchModels, setModels])

  useEffect(() => {
    const init = async () => {

        const allVersion = await getAllVersions(selectedModel)
        const noRegressionVersion = await getSelectedVersion().then(response => response?.version)

        console.log("All Versions", allVersion)
        console.log("nrv", noRegressionVersion)

        setModelVersions(Array.from(new Set(allVersion)).filter(x => x !== noRegressionVersion))
    }

    selectedModel && init()
  }, [axios, setModelVersions, selectedModel])

  useEffect(() => {
    console.log("Model Versions", modelVersions)
  }, [modelVersions])

  useEffect(() => {
    const init = async () => {
      const response = getRegressionModel()
      setSelectedModel(response?.model)
    }

    init()
  }, [axios, setSelectedModel])

  return (
    <div style={{ 
      background: "#111", 
      minHeight: "90vh", 
      padding: "24px",
      color: "#111"
    }}>
      <Card 
        title={
          <span style={{ color: "#fff", fontSize: "20px" }}>
            Regression Load Test
          </span>
        }
        bordered={false}
        style={{ 
          background: "#1a1a1a", 
          borderRadius: "8px",
          boxShadow: "0 4px 12px #111",
          borderBottom: "1px solid #333",
          padding: "24px",
          width: "600px"
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#aaa",
                fontWeight: "500"
              }}>
                Model
              </label>
              <Select
                placeholder="Select Model"
                onChange={(value) => {
                  setSelectedModel(value);
                  setSelectedVersion(null);
                }}
                value={selectedModel}
                style={{ width: "100%" }}
                dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
              >
                {models.map((model) => (
                  <Option key={model} value={model}>{model}</Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#aaa",
                fontWeight: "500"
              }}>
                Version
              </label>
              <Select
                placeholder="Select Version"
                onChange={(value) => setSelectedVersion(value)}
                value={selectedVersion}
                disabled={!selectedModel}
                style={{ width: "100%" }}
                dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
              >
                {selectedModel && Array.isArray(modelVersions) && modelVersions?.map((version) => (
                  <Option key={version} value={version}>{version}</Option>
                ))}
              </Select>
            </div>
          </Col>
          
          {/* <Col xs={24} md={8}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#aaa",
                fontWeight: "500"
              }}>
                Data File
              </label>
              <Dragger
                name="file"
                multiple={false}
                beforeUpload={() => false}
                onChange={handleFileChange}
                accept=".csv"
                showUploadList={false}
                style={{
                  background: "#252525",
                  border: "1px dashed #444",
                  borderRadius: "4px",
                  padding: "24px",
                  height: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                  <InboxOutlined style={{ fontSize: "32px", color: "#666" }} />
                </p>
                <p className="ant-upload-text" style={{ color: "#bbb", marginBottom: 4 }}>
                  {file ? file.name : "Click or drag file to this area"}
                </p>
                <p className="ant-upload-hint" style={{ color: "#666", fontSize: "12px" }}>
                  Support for a single CSV file upload
                </p>
              </Dragger>
            </div>
          </Col> */}
        </Row>
        
        <Divider style={{ borderColor: "#333" }} />
        
        <div style={{ textAlign: "right" }}>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={isProcessing}
            disabled={!selectedModel || !selectedVersion || !regressionReady}
            style={{
              background: "#1890ff",
              borderColor: "#1890ff",
              padding: "0 24px",
              height: "40px",
              fontWeight: "500"
            }}
          >
            {isProcessing ? "Processing..." : "Run Regression"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegressionLoadTest;