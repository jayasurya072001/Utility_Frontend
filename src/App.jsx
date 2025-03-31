import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar.jsx";
import FreshLoadTest from "./pages/FreshLoadTest.jsx";
import AnalysisVerification from "./pages/AnalysisVerification.jsx";
import RegressionLoadTest from "./pages/RegressionLoadTest.jsx";
import UrlModelTest from './pages/UrlModelTest.jsx'
import FileModelTest from './pages/FileModelTest.jsx'
import Analysis from "./pages/Analysis.jsx";
import HomePage from "./pages/HomePage.jsx";

const { Content } = Layout;

const App = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar/>
      <Layout>
        <Content style={{ padding: "20px", background: "#111", color: "#fff" }}>
          <Routes>
            <Route path="/fresh-load" element={<FreshLoadTest />} />
            <Route path="/analysis-verification" element={<AnalysisVerification />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/regression-load" element={<RegressionLoadTest />} />
            <Route path="/urlmodel-test" element={<UrlModelTest />} />
            <Route path="/file-upload" element={<FileModelTest />} />
            <Route path="/" element={< HomePage/>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
