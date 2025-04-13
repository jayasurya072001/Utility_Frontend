import React, { useState, useEffect } from "react";
import { Select, Input, Button, Card, Divider, Row, Col, Typography, message, Space } from "antd";
import { ThunderboltOutlined, LinkOutlined, ClearOutlined } from "@ant-design/icons";
import { fetchModels, runUrlModelTest } from "../util-api/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const UrlModelTest = () => {
  const [models, setModels] = useState(null); // Initialize as null
  const [model, setModel] = useState(null);
  const [version, setVersion] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true); // Add loading state for models

  const navigate = useNavigate()

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

  const handleSubmit = async () => {
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

  const handleClear = () => {
    setModel(null);
    setVersion(null);
    setImageUrl("");
    setResponse(null);
    message.success("Inputs cleared successfully!");
  };

  // Get model names safely
  const modelNames = models ? Object.keys(models) : [];

  return (
    <div style={{ minHeight: "90vh", padding: "24px", color: "#e0e0e0" }}>
      <Card
        bordered={false}
        headStyle={{ borderBottom: "1px solid #333", background: "linear-gradient(90deg, #1a1a1a 0%, #222 100%)" }}
        bodyStyle={{ padding: "24px" }}
        style={{
          background: "#1a1a1a",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          maxWidth: "800px",
          margin: "0 auto",
        }}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ThunderboltOutlined style={{ fontSize: "24px", color: "#1890ff", marginRight: "12px" }} />
            <Title level={3} style={{ color: "#fff", margin: 0 }}>URL Model Test</Title>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
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
              dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
              suffixIcon={<ThunderboltOutlined style={{ color: "#666" }} />}
              loading={isLoadingModels}
              disabled={isLoadingModels}
            >
              {modelNames.map((modelName) => (
                <Option key={modelName} value={modelName}>
                  <div style={{ color: "#e0e0e0" }}>{modelName}</div>
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
              dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
            >
              {model && models && models[model]?.map((version) => (
                <Option key={version} value={version}>
                  <div style={{ color: "#e0e0e0" }}>{version}</div>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Rest of your component remains the same */}
        <div style={{ marginBottom: "24px" }}>
          <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>Image URL</Text>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            prefix={<LinkOutlined style={{ color: "#666" }} />}
            style={{ width: "100%", background: "#252525", borderColor: "#333", color: "#fff" }}
          />
        </div>

        <Divider style={{ borderColor: "#333" }} />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!model || !version || !imageUrl || isLoadingModels}
            style={{ height: "42px", width: "100%", background: "linear-gradient(90deg, #1890ff 0%, #096dd9 100%)", border: "none", fontWeight: "500", fontSize: "16px" }}
          >
            {isLoading ? "Processing..." : "Run Analysis"}
          </Button>

          <Button 
            onClick={handleClear}
            disabled={(!model && !version && !imageUrl && !response) || isLoadingModels}
            style={{ height: "42px", width: "100%", background: "#333", borderColor: "#444", color: "#fff", fontWeight: "500", fontSize: "16px" }}
            icon={<ClearOutlined />}
          >
            Clear
          </Button>
        </Space>

        {response && (
          <>
            <Divider style={{ borderColor: "#333" }} />
            <div style={{ background: "#252525", borderRadius: "4px", padding: "16px", marginTop: "24px" }}>
              <Text strong style={{ display: "block", marginBottom: "12px", color: "#1890ff", fontSize: "16px" }}>Analysis Results</Text>
              <pre style={{ whiteSpace: "pre-wrap", color: "#0f0", margin: 0, fontFamily: "'Fira Code', monospace", fontSize: "14px", background: "#1a1a1a", padding: "12px", borderRadius: "4px", border: "1px solid #333" }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default UrlModelTest;