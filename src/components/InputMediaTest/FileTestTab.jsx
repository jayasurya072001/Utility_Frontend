import React, { useState } from "react";
import { Button, Row, Col, Typography, Upload, message } from "antd";
import {
  ThunderboltOutlined,
  ClearOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ModelsDropdown from "../ModelsDropdown";

const { Text } = Typography;
const { Dragger } = Upload;

const FileTestTab = ({
  model,
  setModel,
  version,
  setVersion,
  file,
  isLoading,
  handleFileChange,
  handleFileSubmit,
  handleClear,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Custom file change handler to create preview
  const onFileChange = (info) => {
    console.log("File change event:", info);

    // In Ant Design Upload, the file is in info.file
    const fileObj = info.file;

    // Check if it's a valid file
    if (!fileObj) {
      console.error("No file object found in the upload info");
      return;
    }

    // Check if file is an image
    if (!fileObj.type || !fileObj.type.startsWith("image/")) {
      message.error("Please upload an image file!");
      return;
    }

    // Call the parent handler
    handleFileChange(info);

    // For Ant Design Upload, the actual file is in fileObj or fileObj.originFileObj
    const actualFile = fileObj.originFileObj || fileObj;

    console.log("Actual file to read:", actualFile);

    if (actualFile && actualFile instanceof File) {
      console.log("Creating preview for file:", actualFile.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("FileReader loaded successfully");
        setPreviewUrl(e.target.result);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        message.error("Failed to read the image file");
      };
      reader.readAsDataURL(actualFile);
    } else {
      console.error("Invalid file object:", actualFile);
      message.error("Invalid file format or file not accessible");
    }
  };

  // Custom clear handler
  const onClear = () => {
    console.log("Clearing file and preview");
    handleClear();
    setPreviewUrl(null);
  };

  console.log(
    "Render state - previewUrl:",
    previewUrl ? "exists" : "null",
    "file:",
    file
  );

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

      {/* File Upload */}
      <Row gutter={[24, 24]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "16px",
              height: "100%",
              border: "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Image */}
            {previewUrl && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.15,
                  filter: "blur(3px)",
                  zIndex: 0,
                }}
              />
            )}

            {/* Content (with higher z-index) */}
            <div style={{ position: "relative", zIndex: 1 }}>
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
                <UploadOutlined style={{ marginRight: "8px" }} />
                Upload Image
              </Text>

              <Dragger
                name="file"
                multiple={false}
                onChange={onFileChange}
                beforeUpload={() => false}
                disabled={isLoading}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: previewUrl ? "1px dashed #1890ff" : "1px dashed #444",
                  borderRadius: "6px",
                  padding: "16px",
                  transition: "all 0.3s ease",
                }}
                showUploadList={false}
                accept="image/*"
                listType="picture"
              >
                <div style={{ padding: "8px" }}>
                  {previewUrl ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          objectFit: "contain",
                          borderRadius: "4px",
                          marginBottom: "12px",
                        }}
                      />
                      <p style={{ color: "#e0e0e0" }}>
                        {file?.name || "Selected image"}
                      </p>
                      <p style={{ color: "#aaa", fontSize: "12px" }}>
                        Click or drag again to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined
                          style={{ color: "#1890ff", fontSize: "32px" }}
                        />
                      </p>
                      <p style={{ color: "#e0e0e0", marginTop: "8px" }}>
                        Click or drag file to this area to upload
                      </p>
                      <p style={{ color: "#aaa", fontSize: "12px" }}>
                        Support for a single image file (JPG, PNG, JPEG, etc.)
                      </p>
                    </>
                  )}
                </div>
              </Dragger>
            </div>
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
          onClick={handleFileSubmit}
          loading={isLoading}
          disabled={!model || !version || !file}
          style={{
            height: "40px",
            borderRadius: "6px",
            background:
              !model || !version || !file
                ? "#333"
                : "linear-gradient(90deg, #1890ff, #096dd9)",
            border: "none",
            boxShadow: "0 4px 12px rgba(24,144,255,0.3)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          Analyze File
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={onClear}
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

export default FileTestTab;
