import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import axios from "axios";
import Sidebar from "./components/Sidebar.jsx";
import FreshLoadTest from "./pages/FreshLoadTest.jsx";
import AnalysisVerification from "./pages/AnalysisVerification.jsx";
import RegressionLoadTest from "./pages/RegressionLoadTest.jsx";
import UrlModelTest from "./pages/UrlModelTest.jsx";
import FileModelTest from "./pages/FileModelTest.jsx";
import Analysis from "./pages/Analysis.jsx";
import HomePage from "./pages/HomePage.jsx";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignUpPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import Chunks from "./pages/Chunks.jsx";
import ChunkAnalysis from "./pages/ChunkAnalysis.jsx";
import InputMediaTest from "./pages/InputMediaTest.jsx";
import GenerateImageUrl from "./pages/GenerateImageUrl.jsx";
import ModelsRunningStatus from "./pages/ModelsRunningStatus.jsx";
import ImageSearch from "./ModelsPages/ImageSearch.jsx";
import Task from "./pages/Task.jsx";

const { Content } = Layout;

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const noSidebarRoutes = ["/login", "/task", "/"];

  const isSidebarVisible = !noSidebarRoutes.includes(location.pathname);

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

  return loading ? (
    <h1>Loading</h1>
  ) : (
    <Layout style={{ minHeight: "100vh" }}>
      <Toaster />
      {isSidebarVisible && <Sidebar />}
      <Layout
        style={{
          background: "#111",
          marginLeft: isSidebarVisible
            ? sidebarCollapsed
              ? "80px"
              : "250px"
            : "0",
          transition: "margin-left 0.2s",
          padding: 0,
          margin: 0,
          width: isSidebarVisible
            ? `calc(100% - ${sidebarCollapsed ? "80px" : "250px"})`
            : "100%",
        }}
      >
        <Content
          style={{
            padding: 0,
            background: "#111",
            color: "#fff",
            width: "100%",
            margin: 0,
            overflow: "hidden",
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/adminlogin" element={<AdminLoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/fresh-load" element={<FreshLoadTest />} />
            <Route
              path="/analysis-verification"
              element={<AnalysisVerification />}
            />
            <Route path="/analysis" element={<Chunks />} />
            <Route path="/analysis/:chunk" element={<ChunkAnalysis />} />
            <Route path="/regression-load" element={<RegressionLoadTest />} />
            <Route path="/media-test" element={<InputMediaTest />} />
            <Route path="/generate-image-url" element={<GenerateImageUrl />} />
            <Route path="/models-running" element={<ModelsRunningStatus />} />
            <Route path="/image-search" element={<ImageSearch />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/task" element={<Task />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
