import React, { useState } from 'react';
import { Upload, Button, Select, Typography, message, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import AnalysisCard from '../components/AnalysisCard';
import '../css/analysis-main.css';

const { Title } = Typography;
const { Option } = Select;

const Analysis = () => {
    const [data, setData] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // Mock data - replace with API calls
    const MODELS = ['Model A', 'Model B', 'Model C'];
    const MODEL_CLASSES = {
        'Model A': ['Class A1', 'Class A2', 'Class A3'],
        'Model B': ['Class B1', 'Class B2', 'Class B3'],
        'Model C': ['Class C1', 'Class C2', 'Class C3']
    };
    const ANALYSTS = ['Analyst 1', 'Analyst 2', 'Analyst 3'];

    const handleFileUpload = (info) => {
        const file = info.file;
        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setLoading(false);
                if (!result.data?.length) {
                    message.error("No valid data found in CSV");
                    return;
                }
                const processedData = result.data.map(item => ({
                    ...item,
                    Analysis: '',
                    ExpectedClasses: [],
                    ExpectedScore: '',
                    ReproducedUrls: '',
                    AnalysedBy: ''
                }));
                setData(processedData);
                message.success(`${processedData.length} records loaded`);
            },
            error: (error) => {
                setLoading(false);
                message.error("Failed to parse CSV");
                console.error("Parse error:", error);
            }
        });
    };

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
        <div className="analysis-container">
            <div className="header-controls">
                <Select
                    placeholder="Select Model"
                    value={selectedModel}
                    onChange={setSelectedModel}
                    className="model-selector"
                >
                    {MODELS.map(model => (
                        <Option key={model} value={model}>{model}</Option>
                    ))}
                </Select>

                <Upload
                    beforeUpload={() => false}
                    onChange={handleFileUpload}
                    accept=".csv"
                    showUploadList={false}
                    disabled={!selectedModel}
                >
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={loading}
                        className="upload-btn"
                    >
                        Upload CSV
                    </Button>
                </Upload>
            </div>

            {data.length > 0 && (
                <>

                    <div className="cards-grid">
                        {data.map((item, index) => (
                            <AnalysisCard
                                key={index}
                                data={item}
                                onUpdate={(updatedItem) => handleDataUpdate(index, updatedItem)}
                                expectedClasses={MODEL_CLASSES[selectedModel] || []}
                                analysts={ANALYSTS}
                                onPreview={showPreview}
                            />
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={exportToCSV}
                            className="export-btn"
                        >
                            Export Results
                        </Button>
                    </div>
                </>
            )}

            <Modal
                visible={isPreviewVisible}
                footer={null}
                onCancel={() => setIsPreviewVisible(false)}
                centered
                width="auto"
                style={{
                    padding: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#1a1a1a'
                }}
                closeIcon={<CloseCircleOutlined style={{ 
                    color: 'white',
                    fontSize: '24px',
                    background: '#111',
                    borderRadius: '50%',
                    padding: '4px'
                  }} />}
            >
                <img
                    src={previewImage}
                    alt="Fullscreen preview"
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        objectFit: 'contain'
                    }}
                />
            </Modal>
        </div>
    );
};

export default Analysis;