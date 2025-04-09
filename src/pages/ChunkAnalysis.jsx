import React, { useCallback, useEffect, useState } from 'react';
import { Upload, Button, Select, Typography, message, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import AnalysisCard from '../components/AnalysisCard';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/analysis-main.css';
import { getAllAnalysts, getChunkData, getExpectedClasses, getModelClasses, getExpectedScore } from '../util-api/api';

const { Title } = Typography;
const { Option } = Select;

const ChunkAnalysis = () => {
    const [data, setData] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [expectedClasses, setExpectedClasses] = useState([])
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [modelClasses, setModelClasses] = useState([])
    const [analysts, setAnalysts] = useState([])
    const [expectedScore, setExpectedScore] = useState("0.5");

    const { chunk } = useParams()    // Mock data - replace with API calls

    useEffect(() => {
        const init = async () => {
            const response = await getExpectedScore()

            if(response["expected-score"]){
                setExpectedScore(response["expected-score"])
            }
        }

        init()
    }, [setExpectedScore])

    useEffect(() => {
      const init = async () => {
        const response = await getExpectedClasses(selectedModel)

        setExpectedClasses(response)
      }

      if(selectedModel){
        init()
      }
    }, [setExpectedClasses, axios, selectedModel])
  

    const fetchChunks = useCallback(() => {
        if (!chunk) return; // Avoid making requests if chunk is undefined/null
    
        console.log("Fetching chunk:", chunk);

        const init = async () => {
            const response = await getChunkData(chunk)

            setData(response.data)
            setSelectedModel(response.model)

            console.log("Chunk Data", response.data)
        }

        init()
    }, [chunk, setData, setSelectedModel, getChunkData])

    useEffect(() => {
        fetchChunks()
    }, [fetchChunks])

    useEffect(() => {
        const init = async () => {
            const response = await getModelClasses(selectedModel)
            setModelClasses(response)
        }
        if(selectedModel){

            init()
        }
    }, [setModelClasses, axios, selectedModel])

    useEffect(() => {
        const init = async () => {
            const response = getAllAnalysts()
            setAnalysts(response)
        }

        init()
    }, [axios, setAnalysts])

    const handleDataUpdate = (index, updatedItem) => {
        const newData = [...data];
        newData[index] = updatedItem;
        setData(newData);
    };

    const showPreview = (url) => {
        setPreviewImage(url);
        setIsPreviewVisible(true);
    };

    const exportToCSV = () => {
        if (data.length === 0) {
            message.warning("No data to export");
            return;
        }

        const csvData = data.map(item => ({
            ...item,
            ExpectedClasses: item.ExpectedClasses.join(',')
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'analysis_results.csv';
        link.click();
        const notification = document.createElement('div');
        notification.textContent = 'CSV File Downloaded Successfully!';
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

        // Add animation
        notification.style.animation = 'fadeInOut 2s ease-in-out';

        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 1500);
    };

    return (
        <div className="analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="header-controls">
                {selectedModel}
            </div>
    
            {data.length > 0 && (
                <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ /* Optional styling for individual card container */ }}>
                            <AnalysisCard
                                key={index}
                                data={{ ...item, expectedScore }}
                                onUpdate={(updatedItem) => handleDataUpdate(index, updatedItem)}
                                expectedClasses={expectedClasses}
                                analysts={analysts}
                                onPreview={showPreview}
                                chunk={chunk}
                                fetchChunks={fetchChunks}
                                expectedScore={expectedScore}
                                // You might need to adjust styling within AnalysisCard as well
                                style={{ /* Optional styling to override AnalysisCard's default */ }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChunkAnalysis;