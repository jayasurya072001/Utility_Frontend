import React from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, Button, Tooltip } from "antd";
import {
  FileText,
  BarChart,
  Repeat,
  Link as LinkIcon,
  Upload,
  Image,
  Activity,
  Server,
  Cpu,
  Settings,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  icons,
} from "lucide-react";
import "../styles.css";
import { useEffect, useState } from "react";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const [userRole, setUserRole] = useState("user"); // Default to user
  const [collapsed, setCollapsed] = useState(false); // State to track sidebar collapse

  useEffect(() => {
    // Get user role from localStorage or token when component mounts
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        // Simple token parsing - consider using jwt-decode in production
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        setUserRole(tokenData.privilege || "user");
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }

    // Check if we have a saved preference for sidebar state
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsedState !== null) {
      setCollapsed(savedCollapsedState === "true");
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  const menuItems = [
    { key: "fresh-load", label: "Fresh Load Test", icon: <FileText /> },
    { key: "analysis", label: "Analysis", icon: <Settings /> },
    { key: "regression-load", label: "Regression Load Test", icon: <Repeat /> },
    { key: "media-test", label: "Input Media Test", icon: <LinkIcon /> },
    { key: "generate-image-url", label: "Generate Image Url", icon: <Image /> },
    { key: "models-running", label: "Models Running Status", icon: <Cpu /> },
    {
      key: "models-training",
      label: "Models Training Status",
      icon: <Activity />,
    },
    // Only include register item if user is admin
    ...(userRole === "admin"
      ? [{ key: "register", label: "Create Users", icon: <UserPlus /> }]
      : []),
  ];

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      trigger={null} // Remove default trigger
      collapsedWidth={80}
      style={{
        background: "#000",
        color: "#fff",
        position: "fixed",
        height: "100vh",
        overflow: "auto",
        transition: "all 0.2s",
      }}
      className="custom-sidebar" // Add a custom class for more specific styling
    >
      <div
        className="logo"
        style={{
          padding: collapsed ? "20px 0" : "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {collapsed ? (
          <Tooltip title="Utility Tools" placement="right">
            <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
              <Settings size={24} />
            </Link>
          </Tooltip>
        ) : (
          <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
            Utility Tools
          </Link>
        )}
      </div>

      {/* Toggle button */}
      <Button
        type="text"
        onClick={toggleCollapsed}
        className="sidebar-toggle-btn"
        style={{
          color: "#fff",
          position: "absolute",
          top: "20px",
          right: "10px",
          zIndex: 1,
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
        }}
        icon={
          collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
        }
      />

      <Menu theme="dark" mode="inline" style={{ background: "#000" }}>
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={`/${item.key}`} style={{ color: "#fff" }}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}

        {/* Submenu for Servers Running Status */}
        <SubMenu
          key="servers-running"
          icon={<Server />}
          title="Servers Running Status"
        >
          <Menu.Item key="servers-qa">
            <Link to="/servers-qa" style={{ color: "#fff" }}>
              QA
            </Link>
          </Menu.Item>
          <Menu.Item key="servers-production">
            <Link to="/servers-production" style={{ color: "#fff" }}>
              Production
            </Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
