import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
  Badge,
  Progress,
  Divider,
} from "antd";
import {
  RefreshCw,
  Power,
  Play,
  RotateCw,
  Info,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  HardDrive,
  BarChart2,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const StatusIndicator = ({ status, label }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
  >
    {status === "running" ? (
      <CheckCircle size={18} color="#52c41a" />
    ) : (
      <XCircle size={18} color="#ff4d4f" />
    )}
    <Text style={{ color: "#d9d9d9", fontSize: 14 }}>{label}</Text>
  </div>
);

const ImageSearch = () => {
  const location = useLocation();
  const selectedModel = location.state?.selectedModel;
  const [vmStats, setVmStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chartData, setChartData] = useState({
    healthScoreData: [],
    processedData: [],
    statusData: [],
    processingTimeData: [],
  });

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

  const fetchVmStatus = async (model) => {
    try {
      const response = await axios.get(
        `http://48.217.82.89:5147/vm/models/${model}/vms`
      );
      return response;
    } catch (error) {
      console.error("Error fetching VM status:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!selectedModel) {
        console.error("No model selected");
        setLoading(false);
        return;
      }

      const res = await fetchVmStatus(selectedModel);
      setVmStats(res.data.vms || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Error fetching VM status for ${selectedModel}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 300000); // refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [selectedModel]);

  const handleVMAction = async (vm, action) => {
    setActionLoading((prev) => ({ ...prev, [vm]: true }));
    try {
      console.log(`${action} VM:`, vm);
      // Replace with actual API call when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchData();
    } catch (err) {
      console.error(`Error ${action} VM ${vm}:`, err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [vm]: false }));
    }
  };

  const getProcessingTimeColor = (time) => {
    if (!time) return "#d9d9d9";
    const seconds = parseFloat(time);
    if (seconds > 20) return "#ff4d4f";
    if (seconds > 10) return "#faad14";
    return "#52c41a";
  };

  const getHealthScore = (vm) => {
    let score = 100;

    // Check if VM is running
    if (vm.status !== "running") score = 0;

    // Check processing time if available
    if (vm.avgProcessingTime) {
      if (parseFloat(vm.avgProcessingTime) > 20) score -= 30;
      else if (parseFloat(vm.avgProcessingTime) > 10) score -= 20;
    }

    // Check last heartbeat
    // if (vm.lastHeartBeat) {
    //   const lastHeartbeat = new Date(vm.lastHeartBeat);
    //   const now = new Date();
    //   const diffMinutes = (now - lastHeartbeat) / (1000 * 60);

    //   if (diffMinutes > 10) score -= 30;
    //   else if (diffMinutes > 5) score -= 15;
    // }

    return Math.max(0, score);
  };

  useEffect(() => {
    if (vmStats.length > 0) {
      const healthScoreData = vmStats.map((vm) => ({
        vm: vm.vm,
        score: getHealthScore(vm),
        status: vm.status,
      }));
      const processedData = vmStats.map((vm) => ({
        vm: vm.vm,
        processed: vm.totalProcessed || 0,
        status: vm.status,
      }));
      const statusData = [
        {
          type: "Running",
          value: vmStats.filter((vm) => vm.status === "running").length,
        },
        {
          type: "Stopped",
          value: vmStats.filter((vm) => vm.status !== "running").length,
        },
      ];
      const processingTimeData = vmStats.map((vm) => ({
        vm: vm.vm,
        processingTime: vm.avgProcessingTime || 0,
        status: vm.status,
      }));
      setChartData({
        healthScoreData,
        processedData,
        statusData,
        processingTimeData,
      });
    }
  }, [vmStats]);

  if (loading && !vmStats.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin indicator={<RefreshCw className="spin-icon" />} size="large" />
      </div>
    );
  }
  const sidebarWidth = sidebarCollapsed ? 80 : 250;
  return (
    <div
      style={{
        padding: "2rem",
        width: "80%",
        margin: "0 auto",
        marginLeft: `calc(${sidebarWidth}px + 20px)`,
        minHeight: "100vh",
      }}
    >
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #444;
          }
          
          @keyframes pulse-border {
            0% {
              box-shadow: 0 0 0 0 rgba(250, 140, 22, 0.7);
              border-color: rgba(250, 140, 22, 0.7);
            }
            50% {
              box-shadow: 0 0 10px 0 rgba(250, 140, 22, 0.9);
              border-color: rgba(250, 140, 22, 1);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(250, 140, 22, 0.7);
              border-color: rgba(250, 140, 22, 0.7);
            }
          }
          
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .restarting-icon {
            animation: rotate 1.5s linear infinite;
          }
          
          .restarting-card {
            animation: pulse-border 2s infinite;
          }
        `}
      </style>
      <Card
        title={
          <Space align="center" size="middle">
            <Server size={28} color="#8c8c8c" />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              {selectedModel
                ? `${selectedModel} VM Dashboard`
                : "VM Management Dashboard"}
            </Title>
          </Space>
        }
        extra={
          <Space size="large">
            {lastUpdated && (
              <Space size={6} style={{ marginRight: 8 }}>
                <Clock size={18} color="#8c8c8c" />
                <Text type="secondary" style={{ color: "#8c8c8c" }}>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </Space>
            )}
            <Tooltip title="Refresh data">
              <Button
                icon={<RefreshCw size={18} />}
                onClick={fetchData}
                loading={loading}
                type="text"
                style={{ color: "#8c8c8c" }}
                size="large"
              />
            </Tooltip>
          </Space>
        }
        style={{
          backgroundColor: "#141414",
          border: "1px solid #303030",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          width: "100%",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #303030",
            background: "linear-gradient(90deg, #1a1a1a 0%, #141414 100%)",
          }}
        >
          <Space direction="vertical" size={4}>
            <Text style={{ color: "#bfbfbf", fontSize: 15 }}>
              Monitor and manage your {selectedModel} virtual machines
            </Text>
            <Space size={8}>
              <HardDrive size={16} color="#8c8c8c" />
              <Text style={{ color: "#8c8c8c", fontSize: 13 }}>
                {vmStats.length}{" "}
                {vmStats.length === 1 ? "instance" : "instances"} available
              </Text>
              <Text style={{ color: "#8c8c8c", fontSize: 13 }}>
                ({vmStats.filter((vm) => vm.status === "running").length}{" "}
                running)
              </Text>
            </Space>
          </Space>
        </div>

        {/* Main Content - Modern Hexagonal Card Design */}
        {vmStats.length === 0 && !loading ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <AlertCircle size={64} color="#8c8c8c" />
            <Text style={{ color: "#8c8c8c", fontSize: 18 }}>
              No VM instances found for {selectedModel}
            </Text>
            <Button
              type="primary"
              onClick={fetchData}
              icon={<RefreshCw size={18} />}
              size="large"
            >
              Refresh Status
            </Button>
          </div>
        ) : (
          <>
            <Row
              gutter={[24, 24]}
              style={{
                padding: "24px",
                margin: "5px",
                marginLeft: "20px", // Added left margin to move cards to the right
              }}
            >
              {vmStats.map((vm) => (
                <Col xs={24} sm={12} lg={8} key={vm.vm}>
                  <div
                    style={{
                      position: "relative",
                      background: "#141414",
                      borderRadius: "12px",
                      overflow: "hidden",
                      height: "100%",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
                      transition: "all 0.3s ease",
                      border: `1px solid ${
                        vm.status === "running"
                          ? "#177ddc"
                          : vm.status === "restarting"
                          ? "#fa8c16" // Match orange border
                          : "#303030"
                      }`,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "380px", // Set minimum height for all cards
                    }}
                    className={
                      vm.status === "restarting" ? "restarting-card" : ""
                    }
                  >
                    {/* Status Indicator - Top Right Corner */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        width: "80px",
                        height: "80px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0",
                          transform: "rotate(45deg) translate(20px, -20px)",
                          width: "100px",
                          height: "30px",
                          background:
                            vm.status === "running"
                              ? "#177ddc"
                              : vm.status === "restarting"
                              ? "#fa8c16" // Orange color for restarting
                              : "#5c5c5c",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                          }}
                        >
                          {vm.status}
                        </Text>
                      </div>
                    </div>

                    {/* Content Wrapper - Takes all available space */}
                    <div style={{ flex: 1 }}>
                      {/* VM Header with Glowing Icon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                            borderRadius: "50%",
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow:
                              vm.status === "running"
                                ? "0 0 15px rgba(23, 125, 220, 0.5)"
                                : vm.status === "restarting"
                                ? "0 0 15px rgba(250, 140, 22, 0.5)" // Match orange glow
                                : "none",
                            border: `1px solid ${
                              vm.status === "running"
                                ? "#177ddc"
                                : vm.status === "restarting"
                                ? "#fa8c16" // Match orange border
                                : "#303030"
                            }`,
                          }}
                        >
                          {vm.status === "restarting" ? (
                            <RotateCw
                              size={24}
                              color="#fa8c16" // Match orange icon
                              className="restarting-icon"
                            />
                          ) : (
                            <Server
                              size={24}
                              color={
                                vm.status === "running" ? "#177ddc" : "#8c8c8c"
                              }
                            />
                          )}
                        </div>
                        <div>
                          <Text
                            style={{
                              color: "#e6e6e6",
                              fontSize: "18px",
                              fontWeight: "bold",
                              display: "block",
                            }}
                          >
                            {vm.vm}
                          </Text>
                          <Text
                            style={{
                              color: "#8c8c8c",
                              fontSize: "12px",
                            }}
                          >
                            Last updated: {new Date().toLocaleTimeString()}
                          </Text>
                        </div>
                      </div>

                      {/* VM Details */}
                      <div style={{ marginBottom: "20px" }}>
                        {/* Health Score - Circular Progress */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: "80px",
                              height: "80px",
                            }}
                          >
                            <Progress
                              type="circle"
                              percent={getHealthScore(vm)}
                              width={80}
                              strokeColor={{
                                "0%":
                                  getHealthScore(vm) > 85
                                    ? "#52c41a"
                                    : getHealthScore(vm) > 30
                                    ? "#faad14"
                                    : "#ff4d4f",
                                "100%":
                                  getHealthScore(vm) > 85
                                    ? "#389e0d"
                                    : getHealthScore(vm) > 30
                                    ? "#d48806"
                                    : "#cf1322",
                              }}
                              strokeWidth={8}
                              trailColor="#252525"
                              format={(percent) => (
                                <span
                                  style={{
                                    color:
                                      getHealthScore(vm) > 85
                                        ? "#52c41a"
                                        : getHealthScore(vm) > 30
                                        ? "#faad14"
                                        : "#ff4d4f",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {percent}%
                                </span>
                              )}
                            />
                          </div>

                          {/* Performance Stats */}
                          {vm.status === "running" && (
                            <div
                              style={{
                                flex: 1,
                                marginLeft: "16px",
                              }}
                            >
                              <div
                                style={{
                                  marginBottom: "12px",
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#8c8c8c",
                                    fontSize: "12px",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Processing Time
                                </Text>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <Clock
                                    size={16}
                                    color={getProcessingTimeColor(
                                      vm.avgProcessingTime || 0
                                    )}
                                  />
                                  <Text
                                    style={{
                                      color: getProcessingTimeColor(
                                        vm.avgProcessingTime || 0
                                      ),
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {vm.avgProcessingTime
                                      ? `${vm.avgProcessingTime.toFixed(2)}s`
                                      : "N/A"}
                                  </Text>
                                </div>
                              </div>

                              <div>
                                <Text
                                  style={{
                                    color: "#8c8c8c",
                                    fontSize: "12px",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Total Processed
                                </Text>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <BarChart2 size={16} color="#8c8c8c" />
                                  <Text
                                    style={{
                                      color: "#d9d9d9",
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {vm.totalProcessed || 0}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {vm.status === "running" && vm.mediaId && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                background: "#252525",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Info size={14} color="#8c8c8c" />
                            </div>
                            <div>
                              <Text
                                style={{
                                  color: "#8c8c8c",
                                  fontSize: "12px",
                                  display: "block",
                                  marginBottom: "2px",
                                }}
                              >
                                Media ID
                              </Text>
                              <Text
                                style={{
                                  color: "#d9d9d9",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                {vm.mediaId}
                              </Text>
                            </div>
                          </div>
                        )}

                        {vm.startTime && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                background: "#252525",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Clock size={14} color="#8c8c8c" />
                            </div>
                            <div>
                              <Text
                                style={{
                                  color: "#8c8c8c",
                                  fontSize: "12px",
                                  display: "block",
                                  marginBottom: "2px",
                                }}
                              >
                                Start Time
                              </Text>
                              <Text
                                style={{
                                  color: "#d9d9d9",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                {new Date(vm.startTime).toLocaleString()}
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Gradient Styled - Now at the bottom */}
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "auto", // Push to bottom
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<Play size={16} />}
                        onClick={() => handleVMAction(vm.vm, "start")}
                        loading={actionLoading[vm.vm]}
                        disabled={
                          vm.status === "running" || vm.status === "restarting"
                        }
                        style={{
                          flex: 1,
                          background:
                            vm.status !== "running" &&
                            vm.status !== "restarting"
                              ? "linear-gradient(135deg, #389e0d 0%, #52c41a 100%)"
                              : undefined,
                          border:
                            vm.status !== "running" &&
                            vm.status !== "restarting"
                              ? "none"
                              : undefined,
                          boxShadow:
                            vm.status !== "running" &&
                            vm.status !== "restarting"
                              ? "0 4px 12px rgba(82, 196, 26, 0.2)"
                              : undefined,
                        }}
                      >
                        Start
                      </Button>
                      <Button
                        danger
                        icon={<Power size={16} />}
                        onClick={() => handleVMAction(vm.vm, "stop")}
                        loading={actionLoading[vm.vm]}
                        disabled={
                          vm.status !== "running" || vm.status === "restarting"
                        }
                        style={{
                          flex: 1,
                          background:
                            vm.status === "running" &&
                            vm.status !== "restarting"
                              ? "linear-gradient(135deg, #cf1322 0%, #ff4d4f 100%)"
                              : undefined,
                          border:
                            vm.status === "running" &&
                            vm.status !== "restarting"
                              ? "none"
                              : undefined,
                          boxShadow:
                            vm.status === "running" &&
                            vm.status !== "restarting"
                              ? "0 4px 12px rgba(255, 77, 79, 0.2)"
                              : undefined,
                        }}
                      >
                        Stop
                      </Button>
                      <Button
                        icon={<RotateCw size={16} />}
                        onClick={() => handleVMAction(vm.vm, "restart")}
                        loading={actionLoading[vm.vm]}
                        disabled={vm.status === "restarting"}
                        style={{
                          flex: 1,
                          background:
                            vm.status !== "restarting"
                              ? "linear-gradient(135deg, #096dd9 0%, #1890ff 100%)"
                              : "linear-gradient(135deg, #0050b3, #096dd9)",
                          border: "none",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
                        }}
                      >
                        {vm.status === "restarting"
                          ? "Restarting..."
                          : "Restart"}
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default ImageSearch;
