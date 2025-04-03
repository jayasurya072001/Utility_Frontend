import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const Chunks = () => {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()

  const handleClick = (file) => {
    console.log("Clicked on:", file);
    // Add your click handling logic here (e.g., navigate or show details)

    navigate(`/analysis/${file}`)
  };

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/utilities/analysis/get_chunks"); // Replace with actual API URL
        setChunks(response.data);
      } catch (error) {
        console.error("Error fetching chunks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, [axios, setLoading, setChunks]);

  return (
    <div className="dark-app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1 className="dark-form-title">Chunks</h1>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {loading ? (
            <Spin size="large" />
        ) : (
            chunks.map((chunk) => (

            <Card 
                key={chunk.file} 
                className="dark-form-card" 
                style={{ 
                  width: '400px', 
                  textAlign: 'center', 
                  border: '1px solid #444', 
                  boxShadow: '0 4px 10px rgba(255, 255, 255, 0.1)', 
                  cursor: 'pointer', 
                  flex: "0 0 33.33%" 
                }}
                onClick={() => handleClick(chunk.file)}
            >
                <p style={{ color: "white" }}><strong>File:</strong> {chunk.file}</p>
                <p style={{ color: "white" }}><strong>Status:</strong> {chunk.status}</p>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default Chunks;