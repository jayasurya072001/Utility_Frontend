import React, { useState } from "react";
import { Select, Upload, Button, Card, message, Divider, Row, Col } from "antd";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Dragger } = Upload;

const RegressionLoadTest = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const models = ["Model A", "Model B", "Model C"];
  const versions = { 
    "Model A": ["v1.0", "v1.1"], 
    "Model B": ["v2.0"], 
    "Model C": ["v3.0", "v3.1"] 
  };

  const handleFileChange = (info) => {
    const { file } = info;
    if (!file.name.endsWith(".csv")) {
      message.error("Only CSV files are allowed!");
      return;
    }
    setFile(file);
    message.success(`${file.name} uploaded successfully`);
  };

  const handleSubmit = () => {
    if (!selectedModel || !selectedVersion || !file) {
      message.error("Please select a model, version, and upload a CSV file.");
      return;
    }
    
    setIsProcessing(true);
    message.loading({ content: "Processing your file...", key: "upload" });
    
    setTimeout(() => {
      setIsProcessing(false);
      message.success({ content: "Analysis complete!", key: "upload", duration: 3 });
    }, 2000);
  };

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
        headStyle={{ 
          borderBottom: "1px solid #333",
          background: "#1a1a1a"
        }}
        bodyStyle={{ padding: "24px" }}
        style={{ 
          background: "#1a1a1a", 
          borderRadius: "8px",
          boxShadow: "0 4px 12px #111"
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
                {selectedModel && versions[selectedModel].map((version) => (
                  <Option key={version} value={version}>{version}</Option>
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
          </Col>
        </Row>
        
        <Divider style={{ borderColor: "#333" }} />
        
        <div style={{ textAlign: "right" }}>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={isProcessing}
            disabled={!selectedModel || !selectedVersion || !file}
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