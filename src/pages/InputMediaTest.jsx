import React, { useState, useEffect } from "react";
import { Select, Input, Button, Card, Divider, Row, Col, Typography, message, Space, Tabs, Upload } from "antd";
import { ThunderboltOutlined, LinkOutlined, ClearOutlined, UploadOutlined } from "@ant-design/icons";
import { fetchModels, runUrlModelTest, runFileModelTest, getAllVersions } from "../util-api/api";
import { useNavigate } from "react-router-dom";
 
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;
 
const InputMediaTest = () => {
  // Common state
  const [models, setModels] = useState([]);
  const [model, setModel] = useState(null);
  const [modelVersions, setModelVersions] = useState([]);
  const [version, setVersion] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  
  // URL-specific state
  const [imageUrl, setImageUrl] = useState("");
  
  // File-specific state
  const [file, setFile] = useState(null);

  const navigate = useNavigate()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB
 
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        const modelsData = await fetchModels();
        if(modelsData.status === 401){
          navigate('/login')
          return
        }
        setModels(modelsData);
      } catch (error) {
        message.error("Failed to load models");
        console.error(error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const init = async () => {
      const response = await getAllVersions(model)
      console.log("Versions", response)
      setModelVersions(response)
    }

    init()
  }, [model, setModelVersions])
 
  // Common handlers
  const handleClear = () => {
    setModel(null);
    setVersion(null);
    setImageUrl("");
    setFile(null);
    setResponse(null);
    message.success("Inputs cleared successfully!");
  };
 
  // URL handlers
  const handleUrlSubmit = async () => {
    if (!model || !version || !imageUrl) {
      message.error("Please select model, version, and enter an image URL.");
      return;
    }
 
    setIsLoading(true);
    try {
      const result = await runUrlModelTest(model, version, imageUrl);
      setResponse(result);
      message.success("Analysis completed successfully!");
    } catch (error) {
      message.error("Analysis failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
 
  // File handlers
  const handleFileChange = (info) => {
    const { file } = info;
    
    // Check file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      message.error(`Only ${allowedExtensions.join(', ')} files are allowed!`);
      return;
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      message.error('File size must be less than 5MB');
      return;
    }
    
    setFile(file);
    message.success(`${file.name} uploaded successfully`);
  };
 
  const handleFileSubmit = async () => {
    if (!model || !version || !file) {
      message.error("Please select model, version, and upload an image file.");
      return;
    }
 
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('model', model);
      formData.append('version', version);
      
      const result = await runFileModelTest(formData);
      setResponse(result);
      message.success("Analysis completed successfully!");
    } catch (error) {
      message.error("Analysis failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
 
  // Get model names safely
  const modelNames = models
 
  return (
    <div style={{
      minHeight: "90vh",
      padding: "24px",
      color: "#e0e0e0",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }}>
      <Card
        bordered={false}
        headStyle={{ borderBottom: "1px solid #444", background: "#1a1a1a" }}
        bodyStyle={{ padding: "24px" }}
        style={{
          background: "#1a1a1a",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          width: "100vh",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ThunderboltOutlined style={{ fontSize: "28px", color: "#1890ff", marginRight: "12px" }} />
            <Title level={3} style={{ color: "#fff", margin: 0 }}>Model Test</Title>
          </div>
        }
      >
        <Tabs
          defaultActiveKey="url"
          style={{ color: "#e0e0e0" }}
          tabBarStyle={{ marginBottom: "24px", background: "#1a1a1a", color: "#e0e0e0" }}
        >
          <TabPane tab="URL Test" key="url">
            <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Model</Text>
                  <Select
                    placeholder={isLoadingModels ? "Loading models..." : "Select Model"}
                    value={model}
                    onChange={(value) => {
                      setModel(value);
                      setVersion(null);
                    }}
                    style={{ width: "100%" }}
                    dropdownStyle={{ background: "#2a2a2a", border: "1px solid #444" }}
                    suffixIcon={<ThunderboltOutlined style={{ color: "#666" }} />}
                    loading={isLoadingModels}
                    disabled={isLoadingModels}
                  >
                    {Array.isArray(models) && models.map((modelName) => (
                      <Option key={modelName} value={modelName}>
                        <div style={{ color: "#000000" }}>{modelName}</div>
                      </Option>
                    ))}
                  </Select>
                </Col>
 
                <Col xs={24} md={12}>
                  <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Version</Text>
                  <Select
                    placeholder={!model ? "Select model first" : "Select Version"}
                    value={version}
                    onChange={setVersion}
                    disabled={!model || isLoadingModels}
                    style={{ width: "100%" }}
                    dropdownStyle={{ background: "#2a2a2a", border: "1px solid #444" }}
                  >
                    {model && modelVersions && Array.isArray(modelVersions) && modelVersions?.map((version) => (
                      <Option key={version} value={version}>
                        <div style={{ color: "#000000" }}>{version}</div>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
 
              <div style={{ margin: "24px 0" }}>
                <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Image URL</Text>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  prefix={<LinkOutlined style={{ color: "#666" }} />}
                  style={{ width: "100%", background: "#252525", borderColor: "#444", color: "#fff" }}
                />
              </div>
 
              <Divider style={{ borderColor: "#444" }} />
 
              <Space style={{ width: "100%", justifyContent: "space-between", gap: "16px" }}>
                <Button
                  type="primary"
                  onClick={handleUrlSubmit}
                  loading={isLoading}
                  disabled={!model || !version || !imageUrl || isLoadingModels}
                  style={{
                    height: "42px",
                    flex: 1,
                    background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                    border: "none",
                    fontWeight: "500",
                    fontSize: "16px"
                  }}
                >
                  {isLoading ? "Processing..." : "Run Analysis"}
                </Button>
 
                <Button
                  onClick={handleClear}
                  disabled={(!model && !version && !imageUrl && !response) || isLoadingModels}
                  style={{
                    height: "42px",
                    flex: 1,
                    background: "#333",
                    borderColor: "#444",
                    color: "#fff",
                    fontWeight: "500",
                    fontSize: "16px"
                  }}
                  icon={<ClearOutlined />}
                >
                  Clear
                </Button>
              </Space>
            </div>
          </TabPane>
 
          <TabPane tab="File Upload" key="file">
            <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Model</Text>
                  <Select
                    placeholder={isLoadingModels ? "Loading models..." : "Select Model"}
                    value={model}
                    onChange={(value) => {
                      setModel(value);
                      setVersion(null);
                    }}
                    style={{ width: "100%" }}
                    dropdownStyle={{ background: "#2a2a2a", border: "1px solid #444" }}
                    suffixIcon={<ThunderboltOutlined style={{ color: "#666" }} />}
                    loading={isLoadingModels}
                    disabled={isLoadingModels}
                  >
                    {modelNames.map((modelName) => (
                      <Option key={modelName} value={modelName}>
                        <div style={{ color: "#000000" }}>{modelName}</div>
                      </Option>
                    ))}
                  </Select>
                </Col>
 
                <Col xs={24} md={12}>
                  <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Version</Text>
                  <Select
                    placeholder={!model ? "Select model first" : "Select Version"}
                    value={version}
                    onChange={setVersion}
                    disabled={!model || isLoadingModels}
                    style={{ width: "100%" }}
                    dropdownStyle={{ background: "#2a2a2a", border: "1px solid #444" }}
                  >
                    {model && modelVersions && Array.isArray(modelVersions) && modelVersions?.map((version) => (
                      <Option key={version} value={version}>
                        <div style={{ color: "#000000" }}>{version}</div>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
 
              <div style={{ margin: "24px 0" }}>
                <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>
                  Upload Image
                </Text>
                <Dragger
                  name="file"
                  multiple={false}
                  beforeUpload={() => false}
                  onChange={handleFileChange}
                  accept={allowedExtensions.map(ext => `.${ext}`).join(',')}
                  showUploadList={false}
                  style={{
                    background: "#252525",
                    border: "1px dashed #444",
                    borderRadius: "4px",
                    padding: "24px",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                    <UploadOutlined style={{ fontSize: "32px", color: "#666" }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: "#bbb", marginBottom: 4 }}>
                    {file ? file.name : "Click or drag image to this area"}
                  </p>
                  <p className="ant-upload-hint" style={{ color: "#666", fontSize: "12px" }}>
                    Supported formats: {allowedExtensions.join(', ')} (Max 5MB)
                  </p>
                </Dragger>
              </div>
 
              <Divider style={{ borderColor: "#444" }} />
 
              <Space style={{ width: "100%", justifyContent: "space-between", gap: "16px" }}>
                <Button
                  type="primary"
                  onClick={handleFileSubmit}
                  loading={isLoading}
                  disabled={!model || !version || !file || isLoadingModels}
                  style={{
                    height: "42px",
                    flex: 1,
                    background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)",
                    border: "none",
                    fontWeight: "500",
                    fontSize: "16px"
                  }}
                >
                  {isLoading ? "Processing..." : "Run Analysis"}
                </Button>
 
                <Button
                  onClick={handleClear}
                  disabled={(!model && !version && !file && !response) || isLoadingModels}
                  style={{
                    height: "42px",
                    flex: 1,
                    background: "#333",
                    borderColor: "#444",
                    color: "#fff",
                    fontWeight: "500",
                    fontSize: "16px"
                  }}
                  icon={<ClearOutlined />}
                >
                  Clear
                </Button>
              </Space>
            </div>
          </TabPane>
        </Tabs>
 
        {response && (
          <div style={{
            background: "#252525",
            borderRadius: "4px",
            padding: "16px",
            marginTop: "24px",
            width: "100%",
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            <Text strong style={{ display: "block", marginBottom: "12px", color: "#1890ff", fontSize: "16px" }}>Analysis Results</Text>
            <pre style={{
              whiteSpace: "pre-wrap",
              color: "#0f0",
              margin: 0,
              fontFamily: "'Fira Code', monospace",
              fontSize: "14px",
              background: "#1a1a1a",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #444"
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};
 
export default InputMediaTest;