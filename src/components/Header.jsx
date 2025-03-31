import React from "react";
import { Layout } from "antd";

const { Header } = Layout;

const HeaderBar = () => (
  <Header style={{ background: "#111", color: "#fff", textAlign: "center", fontSize: "18px" }}>
    Dashboard
  </Header>
);

export default HeaderBar;
