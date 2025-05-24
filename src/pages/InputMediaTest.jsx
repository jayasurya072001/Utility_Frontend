import React, { useState } from "react";
import { Card, Divider, Typography, message, Tabs } from "antd";
import { LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { runUrlModelTest, runFileModelTest } from "../util-api/api";
import UrlTestTab from "../components/InputMediaTest/UrlTestTab";
import FileTestTab from "../components/InputMediaTest/FileTestTab";
import ResultsDisplay from "../components/InputMediaTest/ResultsDisplay";

const { TabPane } = Tabs;
const { Title } = Typography;

const InputMediaTest = () => {
  // State variables
  const [model, setModel] = useState(null);
  const [version, setVersion] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMediaUrl, setInputMediaUrl] = useState(""); // Track the actual URL used for input

  // Common handlers
  const handleClear = () => {
    setModel(null);
    setVersion(null);
    setImageUrl("");
    setFile(null);
    setResponse(null);
    setInputMediaUrl("");
    message.success("Inputs cleared successfully!");
  };

  // URL Test handlers
  const handleUrlSubmit = async () => {
    if (!model || !version || !imageUrl) {
      message.error("Please select model, version, and enter an image URL.");
      return;
    }

    setIsLoading(true);
    try {
      // Store the URL we're using for the test
      setInputMediaUrl(imageUrl);

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

  // File Upload handlers
  const handleFileChange = (info) => {
    if (info.file.status !== "uploading") {
      setFile(info.file.originFileObj);
    }
  };

  const handleFileSubmit = async () => {
    if (!model || !version || !file) {
      message.error("Please select model, version, and upload an image file.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", model);
      formData.append("version", version);

      const result = await runFileModelTest(formData);

      // For file uploads, the URL will be in the response
      if (result && result.inputMediaUrl) {
        setInputMediaUrl(result.inputMediaUrl);
      }

      setResponse(result);
      message.success("Analysis completed successfully!");
    } catch (error) {
      message.error("Analysis failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "10px 400px",
        minHeight: "100vh",
      }}
    >
      <Card
        title={
          <Title level={3} style={{ color: "#e0e0e0", margin: 0 }}>
            Input Media Test
          </Title>
        }
        style={{
          backgroundColor: "#141414",
          borderColor: "#333",
          borderRadius: "8px",
        }}
      >
        <Tabs
          defaultActiveKey="url"
          style={{ color: "#e0e0e0" }}
          tabBarStyle={{
            marginBottom: "24px",
            background: "linear-gradient(to right, #141414, #1a1a1a)",
            color: "#e0e0e0",
            borderRadius: "8px",
            padding: "4px",
            border: "1px solid #333",
          }}
        >
          <TabPane
            tab={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                }}
              >
                <LinkOutlined style={{ marginRight: "8px" }} />
                URL Test
              </span>
            }
            key="url"
          >
            <UrlTestTab
              model={model}
              setModel={setModel}
              version={version}
              setVersion={setVersion}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              isLoading={isLoading}
              handleUrlSubmit={handleUrlSubmit}
              handleClear={handleClear}
            />
          </TabPane>

          <TabPane
            tab={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                }}
              >
                <UploadOutlined style={{ marginRight: "8px" }} />
                File Upload
              </span>
            }
            key="file"
          >
            <FileTestTab
              model={model}
              setModel={setModel}
              version={version}
              setVersion={setVersion}
              file={file}
              isLoading={isLoading}
              handleFileChange={handleFileChange}
              handleFileSubmit={handleFileSubmit}
              handleClear={handleClear}
            />
          </TabPane>
        </Tabs>

        {response && (
          <>
            <Divider style={{ borderColor: "#333", margin: "32px 0" }} />
            <ResultsDisplay
              response={response}
              imageUrl={inputMediaUrl}
              handleClear={handleClear}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default InputMediaTest;
