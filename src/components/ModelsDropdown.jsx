import React, { useState, useEffect } from "react";
import { Select, Button, Space, Tooltip, message, Tag } from "antd";
import {
  ReloadOutlined,
  ThunderboltOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import {
  fetchAvailableModels,
  refreshModelsCache,
} from "../util-api/model-utils";

const { Option } = Select;

/**
 * Reusable component for model and version selection
 *
 * @param {Object} props
 * @param {string} props.selectedModel - Currently selected model
 * @param {string} props.selectedVersion - Currently selected version
 * @param {Function} props.onModelChange - Callback when model changes
 * @param {Function} props.onVersionChange - Callback when version changes
 * @param {boolean} props.disabled - Whether the selectors are disabled
 * @param {boolean} props.showRefresh - Whether to show refresh button
 * @param {string} props.size - Size of the selectors ('small', 'middle', 'large')
 */
const ModelsDropdown = ({
  selectedModel,
  selectedVersion,
  onModelChange,
  onVersionChange,
  disabled = false,
  showRefresh = true,
  size = "middle",
}) => {
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, []);

  // Load models from API
  const loadModels = async () => {
    setLoading(true);
    try {
      const modelsData = await fetchAvailableModels();
      setModels(modelsData);

      // If no model is selected and we have models, select the first one
      // if (!selectedModel && Object.keys(modelsData).length > 0) {
      //   const firstModel = Object.keys(modelsData)[0];
      //   onModelChange(firstModel);
      // }
    } catch (error) {
      message.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  // Refresh models cache
  const handleRefresh = async (e) => {
    if (e) {
      e.stopPropagation(); // Prevent dropdown from closing
    }
    setRefreshing(true);
    try {
      await refreshModelsCache();
      message.success("Models cache refreshed");
      await loadModels();
    } catch (error) {
      message.error("Failed to refresh models cache");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle model change
  const handleModelChange = (value) => {
    onModelChange(value);

    // Select the latest version of the new model
    if (models[value] && models[value].length > 0) {
      const latestVersion = getLatestVersion(models[value]);
      onVersionChange(latestVersion);
    } else {
      onVersionChange(null);
    }
  };

  // Find the latest version for a model
  const getLatestVersion = (modelVersions) => {
    if (!modelVersions || modelVersions.length === 0) return null;

    // Extract version numbers and find the highest
    return modelVersions.reduce((latest, current) => {
      // Remove 'v' prefix and convert to number for comparison
      const latestNum = parseInt(latest.version.replace(/^v/, ""), 10);
      const currentNum = parseInt(current.version.replace(/^v/, ""), 10);

      return currentNum > latestNum ? current : latest;
    }, modelVersions[0]).version;
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Select
        placeholder={loading ? "Loading models..." : "Select Model"}
        value={selectedModel}
        onChange={handleModelChange}
        style={{
          width: "100%",
          height:
            size === "large" ? "40px" : size === "small" ? "24px" : "32px",
        }}
        disabled={disabled || loading}
        loading={loading}
        size={size}
        suffixIcon={<ThunderboltOutlined />}
        dropdownStyle={{ background: "#1f1f1f", borderRadius: "4px" }}
        dropdownRender={(menu) => (
          <div>
            {menu}
            {showRefresh && (
              <div
                style={{
                  padding: "8px",
                  borderTop: "1px solid #333",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={refreshing}
                  disabled={disabled}
                  size={size}
                  style={{ color: "#1890ff" }}
                >
                  Refresh Models
                </Button>
              </div>
            )}
          </div>
        )}
      >
        {Object.keys(models).map((model) => (
          <Option key={model} value={model}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <ThunderboltOutlined style={{ marginRight: 8, flexShrink: 0 }} />
              <span>{model.toUpperCase()}</span>
            </div>
          </Option>
        ))}
      </Select>

      <Select
        placeholder={!selectedModel ? "Select model first" : "Select Version"}
        value={selectedVersion}
        onChange={onVersionChange}
        style={{
          width: "100%",
          height:
            size === "large" ? "40px" : size === "small" ? "24px" : "32px",
        }}
        disabled={disabled || !selectedModel || loading}
        size={size}
        suffixIcon={<CodeOutlined />}
        dropdownStyle={{ background: "#1f1f1f", borderRadius: "4px" }}
      >
        {selectedModel &&
          models[selectedModel]?.map((item) => {
            const isLatest =
              item.version === getLatestVersion(models[selectedModel]);
            return (
              <Option key={item.version} value={item.version}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Space>
                    <CodeOutlined style={{ flexShrink: 0 }} />
                    <span>{item.version}</span>
                    {isLatest && (
                      <Tag
                        color="green"
                        style={{
                          marginLeft: 4,
                          fontSize: "0.7em",
                          padding: "0 4px",
                          height: "18px",
                          lineHeight: "18px",
                        }}
                      >
                        LATEST
                      </Tag>
                    )}
                  </Space>
                  <span
                    style={{
                      fontSize: "0.8em",
                      color: "#888",
                      marginLeft: 8,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.train_name}
                  </span>
                </div>
              </Option>
            );
          })}
      </Select>
    </Space>
  );
};

export default ModelsDropdown;
