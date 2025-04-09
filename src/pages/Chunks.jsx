import { useCallback, useEffect, useState } from "react";
import { Card, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined, DownloadOutlined, CloseCircleOutlined, MergeCellsOutlined, ShrinkOutlined } from '@ant-design/icons';
import "../styles.css";
import toast from "react-hot-toast";
import { getChunks, getSelectedModel, initiateMerge, canMerge } from "../util-api/api";

const Chunks = () => {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState()
  const [CanMerge, setCanMerge] = useState(false)
  const [filteredAnalyst, setFilteredAnalyst] = useState("")

  const navigate = useNavigate()

  const handleClick = (file) => {
    console.log("Clicked on:", file);
    // Add your click handling logic here (e.g., navigate or show details)

    navigate(`/analysis/${file}`)
  };

  const handleMerge = useCallback(() => {
    const init = async () => {
      const response = await initiateMerge()


      if(response?.message && response?.message === "merge successful"){
        toast.success(response.message)

      } else {
        toast.error(response?.error || "Cannot Merge")
      }

      setTimeout(() => {
        window.location.reload()
      }, [2000])
    }

    if(CanMerge){
      init()
    }
  }, [CanMerge])

  useEffect(() => {
    const init = async () => {
      const response = await getSelectedModel()
      setSelectedModel(response?.model)
    }

    init()
  }, [setSelectedModel])

  useEffect(() => {
    const fetchChunks = async () => {
      console.log("Fetching Chunks")
      try {
        const response = await getChunks()
        setChunks(response);
      } catch (error) {
        console.error("Error fetching chunks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, [setLoading, setChunks, getChunks]);

  useEffect(() => {
    const init = async () => {
      const response = await canMerge()

      if(response){
        setCanMerge(response["can-merge"])
      }
    }

    init()
  }, [setCanMerge])

  useEffect(() => {
    console.log("can-merge", CanMerge)
  }, [CanMerge])

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
                <p style={{ color: "white" }}><strong>File:</strong> {chunk?.file}</p>
                <p style={{ color: "white" }}><strong>Analyst:</strong> {chunk?.analyst}</p>
                <p style={{ color: "white" }}><strong>Status:</strong> {chunk?.status}</p>
            </Card>
            ))
        )}
      </div>
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Button
              type="primary"
              disabled={!CanMerge}
              icon={<ShrinkOutlined />}
              onClick={handleMerge}
              className="export-btn"
          >
              Merge Chunks
          </Button>
      </div>
    </div>
  );
};

export default Chunks;