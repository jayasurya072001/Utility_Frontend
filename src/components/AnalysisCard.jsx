import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button, Select, Input, Typography, message } from 'antd';
import { ExpandOutlined, LinkOutlined } from '@ant-design/icons';
import '../css/analysis-card.css'
import axios from 'axios';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AnalysisCard = ({ data, onUpdate, expectedClasses, analysts, onPreview }) => {
    const [localData, setLocalData] = useState(data);
    const [predictionClasses, setPredictionClasses] = useState(null)
    const [reproducedUrls, setReproducedUrls] = useState([])

    useEffect(() => {
        try{
            const detectionString = data['Predicted Classes']

            // Convert single quotes to double quotes
            const jsonFormattedString = detectionString.replace(/'/g, '"');

            // Parse as JSON
            let detectionObject;
            try {
                detectionObject = JSON.parse(jsonFormattedString);
                setPredictionClasses(detectionObject)
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }

        } catch(e) {
            console.error(e)
            console.log(data["Predicted Classes"])
        }
    }, [data, setPredictionClasses])

    const handleChange = (field, value) => {
        const updated = { ...localData, [field]: value };
        setLocalData(updated);
        onUpdate(updated);
    };

    const toggleAnalysis = (type) => {
        const newType = localData.Analysis === type ? '' : type;
        handleChange('Analysis', newType);
    };

    const copyImageUrl = () => {
        navigator.clipboard.writeText(data.inputMediaUrl);

        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = 'URL copied to clipboard!';
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

    const validate = useCallback(async () => {
        response = await axios.post("http://localhost:5000/utilities/analysis/proof-validation", {
            "imageURL": data["inputMediaUrl"],
            "expectedClasses": [],
            "reproducedUrls": []
        })

        console.log("Validation Response", response)
    }, [data, reproducedUrls])

    const handleReproducedUrlChange = useCallback((e) => {
        setReproducedUrls(e)
    }, [setReproducedUrls])

    return (
        <Card className="analysis-card">
            <div className="card-content">
                <div className="image-section">
                    <img
                        src={data["inputMediaUrl"]}
                        alt="Media preview"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23111"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="12" fill="%23888" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                    />
                    <div className="image-actions">
                        <Button
                            icon={<ExpandOutlined />}
                            onClick={() => onPreview(data["inputMediaUrl"])}
                            className="action-btn"
                        />
                        <Button
                            icon={<LinkOutlined />}
                            onClick={copyImageUrl}
                            className="action-btn"
                        />
                    </div>
                </div>

                <div className="data-section">
                    <Text className="meta-field"><span>Result:</span> {data["Result"] || '-'}</Text>
                    <Text className="meta-field"><span>Projection:</span> {data['Projection Layer'] || '-'}</Text>
                    <Text className="meta-field"><span>Detection:</span> {data['Detection Layer'] || '-'}</Text>
                    <Text className="meta-field"><span>Prediction:</span> {data['Predicted Classes'] || '-'}</Text>
                    <div className="analysis-buttons">
                        <Button
                            type={localData.Analysis === 'Bug' ? 'primary' : 'default'}
                            onClick={() => toggleAnalysis('Bug')}
                            className="analysis-btn"
                        >
                            Bug
                        </Button>
                        <Button
                            type={localData.Analysis === 'Not Bug' ? 'primary' : 'default'}
                            onClick={() => toggleAnalysis('Not Bug')}
                            className="analysis-btn"
                        >
                            Not Bug
                        </Button>
                        <Button
                            type={localData.Analysis === 'Outlier' ? 'primary' : 'default'}
                            onClick={() => toggleAnalysis('Outlier')}
                            className="analysis-btn"
                        >
                            Outlier
                        </Button>
                    </div>

                    {localData.Analysis === 'Bug' && (
                        <div className="bug-fields">
                            <div className="form-field">
                                <label>Expected Classes</label>
                                <Select
                                    mode="multiple"
                                    value={localData.ExpectedClasses}
                                    onChange={(val) => handleChange('ExpectedClasses', val)}
                                    placeholder="Select Expected classes"
                                    className="input-field"
                                    style={{ width: '100%' }}
                                >
                                    {expectedClasses.map(cls => (
                                        <Option key={cls} value={cls}>{cls}</Option>
                                    ))}
                                </Select>
                            </div>

                            {/* <div className="form-field">
                                <label>Expected Score</label>
                                <Input
                                    type="number"
                                    value={localData.ExpectedScore}
                                    onChange={(e) => handleChange('ExpectedScore', e.target.value)}
                                    placeholder="Enter Expected score"
                                    className="input-field"
                                />
                            </div> */}

                            <div className="form-field">
                                <label>Reproduced URLs</label>
                                {/* <TextArea
                                    value={localData.ReproducedUrls}
                                    onChange={(e) => handleChange('ReproducedUrls', e.target.value)}
                                    placeholder="Enter URLs (comma separated)"
                                    rows={2}
                                    className="input-field"
                                /> */}
                                <Select
                                    mode="tags"
                                    placeholder="Enter reproduced urls..."
                                    className="dark-styled-select"
                                    value={reproducedUrls}
                                    onChange={handleReproducedUrlChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>Analysed By</label>
                                <Select
                                    value={localData.AnalysedBy}
                                    onChange={(val) => handleChange('AnalysedBy', val)}
                                    placeholder="Select analyst"
                                    className="input-field"
                                    style={{ width: '100%' }}
                                >
                                    {analysts.map(analyst => (
                                        <Option key={analyst} value={analyst}>{analyst}</Option>
                                    ))}
                                </Select>
                            </div>
                            <Button
                                onClick={validate}
                                className='validation-btn'
                            >
                                Validate
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AnalysisCard;