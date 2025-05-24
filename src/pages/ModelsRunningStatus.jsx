import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Space, Tooltip, Row, Col } from "antd";
import { ReloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchAllModelsStatus } from "../util-api/models-status";

const { Title, Paragraph, Text } = Typography;

const ModelsRunningStatus = () => {
  const navigate = useNavigate();
  const [modelsData, setModelsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(savedCollapsedState === "true");
    }

    // Add event listener to detect changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === "sidebarCollapsed") {
        setSidebarCollapsed(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchAllModelsStatus();
      setModelsData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch models status data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 300000); // every 5 mins
    return () => clearInterval(intervalId);
  }, []);

  const handleCardClick = (model) => {
    navigate("/image-search", { state: { selectedModel: model } });
  };

  const handleRefresh = (e) => {
    e?.stopPropagation();
    fetchData();
  };

  const getStatusColor = (canHandle) => {
    return canHandle ? "#52c41a" : "#faad14"; // green if can handle, orange if not
  };

  const getModelCard = (modelName, modelData, targetRpm) => {
    const statusItems = [
      {
        label: "Current RPM",
        value: modelData.current_requests_per_minute?.toFixed(2),
      },
      { label: "Target RPM", value: targetRpm },
      {
        label: "VMs",
        value: `${modelData.running_vms}/${modelData.total_vms}`,
      },
      {
        label: "Avg Processing Time",
        value: `${modelData.avg_processing_time?.toFixed(2)}s`,
      },
      {
        label: "Additional VMs Needed",
        value: modelData.additional_vms_needed,
      },
      {
        label: "Can Handle Target",
        value: modelData.can_handle_target ? "Yes" : "No",
        color: getStatusColor(modelData.can_handle_target),
      },
    ];

    return (
      <Col xs={24} sm={24} md={24} lg={12} xl={8} xxl={6} key={modelName}>
        <Card
          title={
            <Space align="center">
              <Title level={4} style={{ color: "white", margin: 0 }}>
                {modelName}
              </Title>
              <Tooltip title="Refresh data">
                <ReloadOutlined
                  style={{
                    color: "#d9d9d9",
                    cursor: "pointer",
                    transition: "color 0.3s",
                  }}
                  onClick={handleRefresh}
                />
              </Tooltip>
            </Space>
          }
          bordered={false}
          style={{
            backgroundColor: "#141414",
            border: "1px solid #434343",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            marginBottom: 16,
            height: "100%",
          }}
          hoverable
          onClick={() => handleCardClick(modelName)}
          extra={
            <Tooltip title={`Click to view ${modelName} details`}>
              <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
            </Tooltip>
          }
        >
          <div style={{ padding: "8px 0" }}>
            <Paragraph
              style={{
                color: "#bfbfbf",
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              Track VM processing & scaling status
            </Paragraph>

            {statusItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom:
                    index !== statusItems.length - 1
                      ? "1px solid #303030"
                      : "none",
                }}
              >
                <Text strong style={{ color: "#bfbfbf" }}>
                  {item.label}:
                </Text>
                <Text style={{ color: item.color || "#d9d9d9" }}>
                  {item.value}
                </Text>
              </div>
            ))}

            {lastUpdated && (
              <div
                style={{
                  marginTop: 12,
                  textAlign: "right",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    color: "#8c8c8c",
                  }}
                >
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </div>
            )}
          </div>
        </Card>
      </Col>
    );
  };

  // Calculate the left margin based on sidebar state
  const sidebarWidth = sidebarCollapsed ? 80 : 250;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1600px",
        margin: "0 auto",
        marginTop: "5vh",
        marginLeft: `calc(${sidebarWidth}px + 20px)`, // Add extra margin to move content right
        width: `calc(100% - ${sidebarWidth}px - 40px)`, // Adjust width to account for sidebar
      }}
    >
      {loading ? (
        <Card
          style={{
            backgroundColor: "#141414",
            border: "1px solid #434343",
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : modelsData ? (
        <Row gutter={[28, 28]}>
          {Object.entries(modelsData.model_stats).map(
            ([modelName, modelData]) =>
              getModelCard(modelName, modelData, modelsData.target_rpm)
          )}
        </Row>
      ) : (
        <Card
          style={{
            backgroundColor: "#141414",
            border: "1px solid #434343",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "#ff4d4f",
              display: "block",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            Error loading models information
          </Text>
        </Card>
      )}
    </div>
  );
};

export default ModelsRunningStatus;
