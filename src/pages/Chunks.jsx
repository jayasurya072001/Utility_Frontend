import { useCallback, useEffect, useState } from "react";
import { Card, Spin, Button, Input } from "antd";
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
  const [filteredChunks, setFilteredChunks] = useState([])

  useEffect(() => {
    if(filteredAnalyst) {
      setFilteredChunks(chunks.filter((chunk) =>
        chunk.analyst.toLowerCase().includes(filteredAnalyst.toLowerCase())
      ))
    } else {
      setFilteredChunks(chunks)
    }
  }, [filteredAnalyst, setFilteredChunks, chunks])

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

  const handleSearch = useCallback((e) => {
    setFilteredAnalyst(e.target.value)
  }, [setFilteredAnalyst])

  return (
    <div
      className="dark-app-container"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
    >
      <h1 className="dark-form-title">Chunks</h1>
      <style>
        {
          `
            .my-input::placeholder {
              color: #bbbbbb !important
            }
          `
        }
      </style>
      <Input
        placeholder="Search by Analyst"
        onChange={handleSearch}
        className="my-input"
        style={{ width: '300px', marginBottom: '20px', backgroundColor: "#383434", color: "white"}}
      />
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "20px" }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          filteredChunks.map((chunk) => (
            <CustomCard key={chunk.file} chunk={chunk} onClick={() => handleClick(chunk.file)} />
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

const CustomCard = ({ chunk, onClick }) => {
  return (
    <div
      className="custom-card"
      onClick={onClick}
      style={{
        width: '220px', // Adjusted width
        backgroundColor: '#1a1a1d', // Example darker background
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.5)';
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: '#333333',
          padding: '15px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid #555',
        }}
      >
        {chunk.file}
      </div>

      {/* Content Section */}
      <div style={{ padding: '15px', color: '#d7d7e8' }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>Analyst:</strong> {chunk.analyst}
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>Status:</strong> {chunk.status}
        </p>
      </div>

      {/* Footer Section */}
      <div
        style={{
          backgroundColor: '#1a1a1d',
          padding: '10px',
          textAlign: 'center',
          color: '#8be9fd',
          fontWeight: 'bold',
          borderTop: '1px solid #555',
        }}
      >
        Click to View Details
      </div>
    </div>
  );
};