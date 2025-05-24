import React from "react";
import { Input, Button, Row, Col, Typography } from "antd";
import {
  LinkOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import ModelsDropdown from "../ModelsDropdown";

const { Text } = Typography;

const UrlTestTab = ({
  model,
  setModel,
  version,
  setVersion,
  imageUrl,
  setImageUrl,
  isLoading,
  handleUrlSubmit,
  handleClear,
}) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        background: "linear-gradient(145deg, #1a1a1a, #141414)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Model & Version Selection */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Text
              strong
              style={{
                display: "block",
                marginBottom: "12px",
                color: "#bfbfbf",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <ThunderboltOutlined style={{ marginRight: "8px" }} />
              Model & Version
            </Text>
            <ModelsDropdown
              selectedModel={model}
              selectedVersion={version}
              onModelChange={setModel}
              onVersionChange={setVersion}
              disabled={isLoading}
              size="large"
            />
          </div>
        </Col>
      </Row>

      {/* Image URL input */}
      <Row gutter={[24, 24]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "16px",
              height: "100%",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Text
              strong
              style={{
                display: "block",
                marginBottom: "12px",
                color: "#bfbfbf",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <LinkOutlined style={{ marginRight: "8px" }} />
              Image URL
            </Text>
            <Input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                background: "rgba(0,0,0,0.3)",
                borderColor: "#444",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
              prefix={<LinkOutlined style={{ color: "#666" }} />}
              disabled={isLoading}
            />
          </div>
        </Col>
      </Row>

      {/* Action buttons */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleUrlSubmit}
          loading={isLoading}
          disabled={!model || !version || !imageUrl}
          style={{
            height: "40px",
            borderRadius: "6px",
            background:
              !model || !version || !imageUrl
                ? "#333"
                : "linear-gradient(90deg, #1890ff, #096dd9)",
            border: "none",
            boxShadow: "0 4px 12px rgba(24,144,255,0.3)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          Analyze URL
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={handleClear}
          disabled={isLoading}
          style={{
            height: "40px",
            borderRadius: "6px",
            background: "rgba(0,0,0,0.2)",
            borderColor: "#444",
            color: "#bfbfbf",
            display: "flex",
            alignItems: "center",
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default UrlTestTab;
