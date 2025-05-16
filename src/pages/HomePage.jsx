import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Card, Typography, Button } from "antd";
import {
  FileText,
  BarChart,
  Repeat,
  Link as LinkIcon,
  Zap,
  Cpu,
  LogOut,
} from "lucide-react";

const { Content } = Layout;
const { Title, Text } = Typography;

const quickLinks = [
  {
    key: "fresh-load",
    label: "Fresh Load Test",
    icon: <FileText size={24} />,
    description: "Perform initial load testing for new models",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    key: "regression-load",
    label: "Regression Load Test",
    icon: <Repeat size={24} />,
    description: "Run comparative regression tests",
    gradient: "linear-gradient(135deg, #f46b45 0%, #eea849 100%)",
  },
  {
    key: "media-test",
    label: "Media Model Test",
    icon: <LinkIcon size={24} />,
    description: "Test models with URL or FILE inputs",
    gradient: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
  },
  {
    key: "performance-test",
    label: "Performance Metrics",
    icon: <Zap size={24} />,
    description: "View system performance analytics",
    gradient: "linear-gradient(135deg, #43C6AC 0%, #191654 100%)",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="home-page-wrapper">
      <div className="home-page-container">
        {/* Header with logout button */}
        <div className="home-header">
          <Button
            type="text"
            icon={<LogOut />}
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </Button>
        </div>

        {/* Welcome section */}
        <div className="welcome-section">
          <Title level={2} className="welcome-title">
            Welcome to Utility Tools
          </Title>
          <Text className="welcome-subtitle">Select a tool to get started</Text>
        </div>

        {/* Cards grid */}
        <div className="cards-container">
          {quickLinks.map((item, index) => (
            <Link
              to={`/${item.key}`}
              className={`card-link ${
                index === quickLinks.length - 1 && quickLinks.length % 2 !== 0
                  ? "center-last-card"
                  : ""
              }`}
              key={item.key}
            >
              <Card
                hoverable
                className="home-card"
                cover={
                  <div
                    className="card-gradient"
                    style={{ background: item.gradient }}
                  />
                }
              >
                <div className="icon-circle">
                  {React.cloneElement(item.icon, {
                    style: { color: "#1890ff" },
                  })}
                </div>
                <Title level={4} className="card-title">
                  {item.label}
                </Title>
                <Text className="card-description">{item.description}</Text>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
