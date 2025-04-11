import { useCallback, useEffect, useState } from "react";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getChunks,
  getSelectedModel,
  initiateMerge,
  canMerge,
} from "../util-api/api";
import "../css/chunk-main.css";
import "../css/chunk-pagination.css"; // new CSS file for pagination styles

const Chunks = () => {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState();
  const [CanMerge, setCanMerge] = useState(false);
  const [filteredAnalyst, setFilteredAnalyst] = useState("");
  const [filteredChunks, setFilteredChunks] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (filteredAnalyst) {
      setFilteredChunks(
        chunks.filter((chunk) =>
          chunk.analyst.toLowerCase().includes(filteredAnalyst.toLowerCase())
        )
      );
    } else {
      setFilteredChunks(chunks);
    }
  }, [filteredAnalyst, setFilteredChunks, chunks]);

  const navigate = useNavigate();

  const handleClick = (file) => {
    navigate(`/analysis/${file}`);
  };

  const handleMerge = useCallback(() => {
    const init = async () => {
      const response = await initiateMerge();
      if (response?.message === "merge successful") {
        toast.success(response.message);
      } else {
        toast.error(response?.error || "Cannot Merge");
      }
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    if (CanMerge) {
      init();
    }
  }, [CanMerge]);

  useEffect(() => {
    const init = async () => {
      const response = await getSelectedModel();
      setSelectedModel(response?.model);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        const response = await getChunks();
        setChunks(response);
      } catch (error) {
        console.error("Error fetching chunks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChunks();
  }, []);

  useEffect(() => {
    const init = async () => {
      const response = await canMerge();
      if (response) {
        setCanMerge(response["can-merge"]);
      }
    };
    init();
  }, []);

  const handleSearch = useCallback((e) => {
    setFilteredAnalyst(e.target.value);
    setCurrentPage(1); // reset to first page on search
  }, []);

  const paginatedChunks = filteredChunks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="chunk-dashboard">
      <h1 className="chunk-title">📦 Chunk Manager</h1>

      <input
        type="text"
        placeholder="Search by Analyst"
        onChange={handleSearch}
        className="search-input"
      />

      <div className="chunk-grid">
        {loading ? (
          <div className="loader"></div>
        ) : (
          Array.isArray(paginatedChunks) &&
          paginatedChunks.map((chunk) => (
            <ChunkCard
              key={chunk.file}
              chunk={chunk}
              onClick={() => handleClick(chunk.file)}
            />
          ))
        )}
      </div>

      <div className="pagination-container">
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredChunks.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <button
        className={`merge-button ${!CanMerge ? "disabled" : ""}`}
        onClick={handleMerge}
        disabled={!CanMerge}
      >
        🔗 Merge Chunks
      </button>
    </div>
  );
};

export default Chunks;

const ChunkCard = ({ chunk, onClick }) => {
  return (
    <div className="chunk-card" onClick={onClick}>
      <div className="chunk-header">{chunk.file}</div>
      <div className="chunk-body">
        <p>
          <span>Analyst:</span> {chunk.analyst}
        </p>
        <p>
          <span>Status:</span> {chunk.status}
        </p>
      </div>
      <div className="chunk-footer">Click to View Details</div>
    </div>
  );
};
