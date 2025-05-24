import React, { useState } from "react";
import { Button, Typography, Divider, message } from "antd";
import {
  ThunderboltOutlined,
  ClearOutlined,
  LinkOutlined,
  ExpandOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ResultsDisplay = ({ response, imageUrl, handleClear }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  // Use the directly passed imageUrl, falling back to response values if needed
  const displayUrl = imageUrl || response?.inputMediaUrl || response?.url;

  const copyImageUrl = () => {
    if (displayUrl) {
      navigator.clipboard.writeText(displayUrl);
      message.success("URL copied to clipboard!");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #1a1a1a, #0f0f0f)",
        borderRadius: "12px",
        padding: "28px",
        marginTop: "24px",
        width: "100%",
        maxWidth: "800px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#1890ff",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "16px",
            boxShadow: "0 4px 12px rgba(24,144,255,0.3)",
          }}
        >
          <ThunderboltOutlined style={{ color: "white", fontSize: "20px" }} />
        </div>
        <div>
          <Title level={4} style={{ color: "#e0e0e0", margin: 0 }}>
            Analysis Results
          </Title>
        </div>
      </div>

      {/* Image Preview Section */}
      {displayUrl && (
        <div
          style={{
            marginBottom: "24px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: "10px",
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Text strong style={{ color: "#bfbfbf" }}>
              Input Image
            </Text>
            <div>
              <Button
                type="text"
                icon={<LinkOutlined />}
                onClick={copyImageUrl}
                style={{ color: "#8c8c8c" }}
              />
              <Button
                type="text"
                icon={<ExpandOutlined />}
                onClick={() => setPreviewVisible(true)}
                style={{ color: "#8c8c8c" }}
              />
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <img
              src={displayUrl}
              alt="Analyzed"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23111'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='12' fill='%23888' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      )}

      <Divider style={{ borderColor: "#333", margin: "24px 0" }} />

      {response && response.predictions && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Text strong style={{ color: "#bfbfbf" }}>
              Predictions
            </Text>
            <Text style={{ color: "#888", fontSize: "12px" }}>
              Sorted by confidence
            </Text>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "10px",
              padding: "4px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {Object.entries(response.predictions)
              .sort(([, valueA], [, valueB]) => valueB - valueA)
              .map(([key, value]) => {
                const hue = value >= 0.5 ? 120 : 200;
                const saturation = 80 + value * 20;
                const lightness = 45 + value * 10;
                const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                return (
                  <div
                    key={key}
                    style={{
                      padding: "12px 16px",
                      margin: "8px",
                      background:
                        value >= 0.5
                          ? "linear-gradient(90deg, rgba(82,196,26,0.1), rgba(0,0,0,0))"
                          : "rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      border:
                        value >= 0.5
                          ? "1px solid rgba(82,196,26,0.2)"
                          : "1px solid rgba(255,255,255,0.05)",
                      transform: value >= 0.5 ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <Text
                        style={{
                          color: value >= 0.5 ? "#d9d9d9" : "#a6a6a6",
                          fontWeight: value >= 0.5 ? 600 : 400,
                          fontSize: value >= 0.5 ? "15px" : "14px",
                        }}
                      >
                        {key
                          .split("/")
                          .map((part) => part.replace(/_/g, " "))
                          .join(" › ")}
                      </Text>
                      <Text
                        style={{
                          color,
                          fontWeight: "bold",
                          fontSize: value >= 0.5 ? "16px" : "14px",
                          background:
                            value >= 0.5 ? "rgba(0,0,0,0.2)" : "transparent",
                          padding: value >= 0.5 ? "2px 8px" : "0",
                          borderRadius: "12px",
                          border: value >= 0.5 ? `1px solid ${color}` : "none",
                        }}
                      >
                        {value.toFixed(4)}
                      </Text>
                    </div>

                    <div
                      style={{
                        height: "8px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${value * 100}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          borderRadius: "4px",
                          boxShadow:
                            value >= 0.5 ? `0 0 10px ${color}` : "none",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <Button
          type="text"
          icon={<ClearOutlined />}
          onClick={handleClear}
          style={{ color: "#888" }}
        >
          Clear Results
        </Button>
      </div>

      {/* Image Preview Modal */}
      {previewVisible && (
        <div
          className="popup-overlay"
          onClick={() => setPreviewVisible(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(18, 18, 18, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#1e1e1e",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.7)",
            }}
          >
            <img
              src={displayUrl}
              alt="Enlarged"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <button
              className="popup-close-button"
              onClick={() => setPreviewVisible(false)}
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "#2e2e2e",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                fontSize: "18px",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
