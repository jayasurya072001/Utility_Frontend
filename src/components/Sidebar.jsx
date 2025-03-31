import React from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
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
  Settings
} from "lucide-react"
import "../styles.css"
const { Sider } = Layout;
const { SubMenu } = Menu;

const menuItems = [
  { key: "fresh-load", label: "Fresh Load Test", icon: <FileText /> },
  { key: "analysis", label: "Analysis", icon: <Settings />},
  { key: "analysis-verification", label: "Analysis Validation", icon: <BarChart /> },
  { key: "regression-load", label: "Regression Load Test", icon: <Repeat /> },
  { key: "urlmodel-test", label: "Url Model Test", icon: <LinkIcon /> },
  { key: "file-upload", label: "File Upload Model Test", icon: <Upload /> },
  { key: "generate-image", label: "Generate Image Url", icon: <Image /> },
  { key: "models-running", label: "Models Running Status", icon: <Cpu /> },
  { key: "models-training", label: "Models Training Status", icon: <Activity /> },
  
];

const Sidebar = () => (
  <Sider width={250} style={{ background: "#000", color: "#fff" }}>
    <div className="logo">
      <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Utility Tools</Link>
    </div>
    <Menu theme="dark" mode="inline" style={{ background: "#000" }}>
      {menuItems.map((item) => (
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={`/${item.key}`} style={{ color: "#fff" }}>
            {item.label}
          </Link>
        </Menu.Item>
      ))}

      {/* Submenu for Servers Running Status */}
      <SubMenu key="servers-running" icon={<Server />} title="Servers Running Status" >
        <Menu.Item key="servers-qa">
          <Link to="/servers-qa" style={{ color: "#fff" }}>QA</Link>
        </Menu.Item>
        <Menu.Item key="servers-production">
          <Link to="/servers-production" style={{ color: "#fff" }}>Production</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  </Sider>
);

export default Sidebar;
