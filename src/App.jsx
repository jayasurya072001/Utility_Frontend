import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import axios from "axios";
import Sidebar from "./components/Sidebar.jsx";
import FreshLoadTest from "./pages/FreshLoadTest.jsx";
import AnalysisVerification from "./pages/AnalysisVerification.jsx";
import RegressionLoadTest from "./pages/RegressionLoadTest.jsx";
import UrlModelTest from './pages/UrlModelTest.jsx';
import FileModelTest from './pages/FileModelTest.jsx';
import Analysis from "./pages/Analysis.jsx";
import HomePage from "./pages/HomePage.jsx";
import { Toaster } from 'react-hot-toast';
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignUpPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import Chunks from "./pages/Chunks.jsx";
import ChunkAnalysis from "./pages/ChunkAnalysis.jsx";
import InputMediaTest from "./pages/InputMediaTest.jsx";
import GenerateImageUrl from "./pages/GenerateImageUrl.jsx";

const { Content } = Layout;

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  // const [loading, setLoading] = useState(true);  // This needs to be uncommented
  const [loading, setLoading] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  // useEffect(() => {
  //   if(location.pathname in ["/login", "/signup", "/adminlogin"]){
  //     setIsAuthPage(true)
  //   } else {
  //     setIsAuthPage(false)
  //   }
  // }, [location, setIsAuthPage])

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = localStorage.getItem("authToken");

  //     // if (!token) {
  //     //   navigate("/login");
  //     //   return;
  //     // }

  //     try {
  //       const response = await axios.post("http://localhost:5000/auth/verify-token", {}, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  //       setLoading(false)

  //       console.log("Verification Response", response.data);

  //       if (!response?.data?.valid) {
  //         localStorage.removeItem("authToken");
  //         navigate("/login");
  //       } else {
  //         console.log("admin is", response?.data?.admin)
  //         setIsAdmin(response?.data?.admin);
  //       }
  //     } catch (error) {
  //       console.error("Auth check failed", error);
  //       localStorage.removeItem("authToken");
  //       navigate("/login");
  //     }
  //   };
    
  //   checkAuth()
  // }, [location.pathname, navigate, isAuthPage, setLoading]);

  // Redirect non-admin users from /signup
  // useEffect(() => {
  //   console.log("Now admin is", isAdmin)
  //   if (!loading && location.pathname === "/signup" && !isAdmin) {
  //     navigate("/adminlogin");
  //   }
  // }, [location.pathname, isAdmin, navigate, loading]);

  return (

    loading ? <h1>Loading</h1>
    : <Layout style={{ minHeight: "100vh" }}>
      <Toaster />
      {!isAuthPage && <Sidebar />}
      <Layout style={{ background: "#111" }}>
        <Content 
          style={{ 
            padding: "20px", 
            background: "#111", 
            color: "#fff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/adminlogin" element={<AdminLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/fresh-load" element={<FreshLoadTest />} />
            <Route path="/analysis-verification" element={<AnalysisVerification />} />
            <Route path="/analysis" element={<Chunks />} />
            <Route path="/analysis/:chunk" element={<ChunkAnalysis />} />
            <Route path="/regression-load" element={<RegressionLoadTest />} />
            <Route path="/media-test" element={<InputMediaTest />} />
            <Route path="/generate-image-url" element={<GenerateImageUrl />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
