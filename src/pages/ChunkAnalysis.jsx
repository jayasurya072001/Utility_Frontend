import React, { useCallback, useEffect, useState } from 'react';
import { Upload, Button, Select, Typography, message, Modal, Pagination } from 'antd';
import { UploadOutlined, DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import AnalysisCard from '../components/AnalysisCard';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/chunk-analysis.css';
import '../css/popup-image-viewer.css';
import '../css/analysis-pagination.css'

import {
  getAllAnalysts,
  getChunkData,
  getExpectedClasses,
  getModelClasses,
  getExpectedScore
} from '../util-api/api';

const { Title } = Typography;
const { Option } = Select;

const ChunkAnalysis = () => {
  const [data, setData] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [expectedClasses, setExpectedClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [modelClasses, setModelClasses] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [expectedScore, setExpectedScore] = useState("0.5");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { chunk } = useParams();

  useEffect(() => {
    const init = async () => {
      const response = await getExpectedScore();
      if (response["expected-score"]) {
        setExpectedScore(response["expected-score"]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      const response = await getExpectedClasses(selectedModel);
      setExpectedClasses(response);
    };

    if (selectedModel) {
      init();
    }
  }, [selectedModel]);

  const fetchChunks = useCallback(() => {
    if (!chunk) return;

    const init = async () => {
      const response = await getChunkData(chunk);
      setData(response.data);
      setSelectedModel(response.model);
    };

    init();
  }, [chunk]);

  useEffect(() => {
    fetchChunks();
  }, [fetchChunks]);

  useEffect(() => {
    const init = async () => {
      const response = await getModelClasses(selectedModel);
      setModelClasses(response);
    };

    if (selectedModel) {
      init();
    }
  }, [selectedModel]);

  useEffect(() => {
    const init = async () => {
      const response = await getAllAnalysts();
      setAnalysts(response);
    };

    init();
  }, []);

  const handleDataUpdate = (index, updatedItem) => {
    const newData = [...data];
    newData[index] = updatedItem;
    setData(newData);
  };

  const showPreview = (url) => {
    setPreviewImage(url);
    setIsPreviewVisible(true);
  };

  const handleExportPageCSV = () => {
    if (paginatedData.length === 0) {
      message.warning("No data to export on this page");
      return;
    }
  
    exportToCSV(paginatedData, `${chunk}_page_${currentPage}.csv`);
  };
  
  const handleExportFullCSV = () => {
    if (data.length === 0) {
      message.warning("No data in this chunk");
      return;
    }
  
    exportToCSV(data, `${chunk}.csv`);
  };
  
  const exportToCSV = (items, fileName) => {
    const csvData = items.map(item => ({
      ...item,
      ExpectedClasses: Array.isArray(item.ExpectedClasses)
        ? item.ExpectedClasses.join(',')
        : item.ExpectedClasses
    }));
  
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  
    const notification = document.createElement('div');
    notification.textContent = `${fileName} Downloaded Successfully!`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#1890ff';
    notification.style.color = 'white';
    notification.style.padding = '8px 16px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notification.style.animation = 'fadeInOut 2s ease-in-out';
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 1500);
  };

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="analysis-container">
      <div className="header-controls">
        <span>Model: {selectedModel}</span>
        <div className="csv-buttons">
          <Button icon={<DownloadOutlined />} onClick={handleExportPageCSV} style={{ marginRight: '10px' }}>
            Export This Page to CSV
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportFullCSV}>
            Export This Chunk to CSV
          </Button>
        </div>
      </div>

      {data.length > 0 && (
        <>
          <div className="cards-grid">
            {paginatedData.map((item, index) => (
              <AnalysisCard
                key={index + (currentPage - 1) * itemsPerPage}
                data={{ ...item, expectedScore }}
                onUpdate={(updatedItem) => handleDataUpdate(index + (currentPage - 1) * itemsPerPage, updatedItem)}
                expectedClasses={expectedClasses}
                analysts={analysts}
                onPreview={showPreview}
                chunk={chunk}
                expectedScore={expectedScore}
              />
            ))}
          </div>
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={data.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {previewImage && (
        <PopupImageViewer
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default ChunkAnalysis;

const PopupImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged" className="popup-image" />
        <button className="popup-close-button" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};
