import React, { useState } from "react";
import { Select, Upload, Button, Card, Divider, Row, Col, Typography, message, Space } from "antd";
import { ThunderboltOutlined, ClearOutlined, UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;
const { Dragger } = Upload;

const ImageModelTest = () => {
  const [model, setModel] = useState(null);
  const [version, setVersion] = useState(null);
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const models = [
    { name: "Vision Classifier", value: "vision-classifier" },
    { name: "Content Moderation", value: "content-moderation" },
    { name: "Object Detection", value: "object-detection" }
  ];

  const versions = {
    "vision-classifier": ["v1.2.0", "v1.3.1"],
    "content-moderation": ["v2.0.0", "v2.1.3"],
    "object-detection": ["v3.0.0", "v3.2.1"]
  };

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

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

  const handleSubmit = () => {
    if (!model || !version || !file) {
      message.error("Please select model, version, and upload an image file.");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const mockResponse = {
        "na/selfie": 0.9997,
        "yes_image_attributes/blur": 0.0075,
        "yes_breast/partial_visible_breast": 0.0045,
        "yes_genitals/partial_male_genital": 0.0031,
        "yes_bodysuit/female/transparent-meshsuit": 0.0021,
      };
      
      setResponse(mockResponse);
      setIsLoading(false);
      message.success("Analysis completed successfully!");
    }, 1500);
  };

  const handleClear = () => {
    setModel(null);
    setVersion(null);
    setFile(null);
    setResponse(null);
    message.success("Inputs cleared successfully!");
  };

  return (
    <div style={{ 
      minHeight: "90vh", 
      padding: "24px",
      color: "#e0e0e0"
    }}>
      <Card 
        bordered={false}
        headStyle={{ 
          borderBottom: "1px solid #333",
          background: "linear-gradient(90deg, #1a1a1a 0%, #222 100%)"
        }}
        bodyStyle={{ padding: "24px" }}
        style={{ 
          background: "#1a1a1a", 
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          maxWidth: "800px",
          margin: "0 auto"
        }}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ThunderboltOutlined style={{ 
              fontSize: "24px", 
              color: "#1890ff", 
              marginRight: "12px" 
            }} />
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              Image Model Test
            </Title>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>
                Model
              </Text>
              <Select
                placeholder="Select Model"
                value={model}
                onChange={(value) => {
                  setModel(value);
                  setVersion(null);
                }}
                style={{ width: "100%" }}
                dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
                suffixIcon={<ThunderboltOutlined style={{ color: "#666" }} />}
              >
                {models.map((m) => (
                  <Option key={m.value} value={m.value}>
                    <div style={{ color: "#e0e0e0" }}>{m.name}</div>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ display: "block", marginBottom: "8px", color: "#aaa" }}>
                Version
              </Text>
              <Select
                placeholder="Select Version"
                value={version}
                onChange={setVersion}
                disabled={!model}
                style={{ width: "100%" }}
                dropdownStyle={{ background: "#2a2a2a", border: "1px solid #333" }}
              >
                {model && versions[model]?.map((v) => (
                  <Option key={v} value={v}>
                    <div style={{ color: "#e0e0e0" }}>{v}</div>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        <div style={{ marginBottom: "24px" }}>
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
              height: "120px",
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

        <Divider style={{ borderColor: "#333" }} />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!model || !version || !file}
            style={{
              height: "42px",
              width: "100%",
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
            disabled={!model && !version && !file && !response}
            style={{
              height: "42px",
              width: "100%",
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

        {response && (
          <>
            <Divider style={{ borderColor: "#333" }} />
            <div style={{ 
              background: "#252525", 
              borderRadius: "4px",
              padding: "16px",
              marginTop: "24px"
            }}>
              <Text strong style={{ 
                display: "block", 
                marginBottom: "12px", 
                color: "#1890ff",
                fontSize: "16px"
              }}>
                Analysis Results
              </Text>
              <pre style={{ 
                whiteSpace: "pre-wrap", 
                color: "#0f0",
                margin: 0,
                fontFamily: "'Fira Code', monospace",
                fontSize: "14px",
                background: "#1a1a1a",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #333"
              }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ImageModelTest;