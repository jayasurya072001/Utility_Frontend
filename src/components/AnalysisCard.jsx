import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button, Select, Input, Typography, message, Tag } from 'antd';
import { ExpandOutlined, LinkOutlined } from '@ant-design/icons';
import '../css/analysis-card.css'
import axios from 'axios';
import toast from 'react-hot-toast';
import { analysisCardHandleChange, proofValidation, setNotBug, setOutlier } from '../util-api/api';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AnalysisCard = ({ data, onUpdate, expectedClasses, analysts, onPreview, chunk, fetchChunks }) => {
    const [localData, setLocalData] = useState(data);
    const [predictionClasses, setPredictionClasses] = useState(null)
    const [reproducedUrls, setReproducedUrls] = useState([])
    const [selectedExpectedClasses, setSelectedExpectedClasses] = useState([])
    const [expectedClassesOptions, setExpectedClassesOptions] = useState([])
    const [validationLoading, setValidationLoading] = useState(false)

    useEffect(() => {
        if(Array.isArray(expectedClasses)) {
            setExpectedClassesOptions(expectedClasses?.map(each => ({ label: each, value: each })))
        }
    }, [expectedClasses, setExpectedClassesOptions])

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

    const handleChange = async (field, value, type) => {
        if(!type){
            console.log("Unsetting")
            const response = await analysisCardHandleChange(chunk, localData["inputMediaUrl"])
            console.log("Unset Analysis:", response)
        }
        const updated = { ...localData, [field]: value };
        setLocalData(updated);
        onUpdate(updated);
    };

    const toggleAnalysis = (type) => {
        const newType = localData.Analysis === type ? '' : type;
        handleChange('Analysis', newType, type);
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
        const d = {
            "inputMediaUrl": data["inputMediaUrl"],
            "expectedClasses": selectedExpectedClasses,
            "reproducedUrls": reproducedUrls,
            "chunk": chunk
        }

        console.log("validation body", d)
        const response = await proofValidation(d)

        if(response?.invalid_urls && response?.invalid_urls?.length === 0){
            setLocalData(prev => ({ ...prev, "Analysis": "Bug", "Validation": true }))
            toast.success("Validated")
        } else {
            toast.error("Cannot Validate")
        }
        console.log("Validation Response", response)
        console.log("IU", response?.invalid_urls)
        console.log("IUL", response?.invalid_urls?.length)
    }, [data, reproducedUrls, selectedExpectedClasses])

    const handleValidateClick = useCallback(() => {
        validate()
    }, [validate])

    const handleReproducedUrlChange = useCallback((e) => {
        setReproducedUrls(e)
    }, [setReproducedUrls])

    const setNotBugHandler = useCallback(() => {
        const init = async () => {
            const response = setNotBug(chunk, data["inputMediaUrl"])

            fetchChunks()
        }

        init()
    }, [data, chunk, fetchChunks])

    const setOutlierHandler = useCallback(() => {
        const init = async () => {
            const response = setOutlier(chunk, data["inputMediaUrl"])

            fetchChunks()
        }

        init()
    }, [data, chunk, fetchChunks])

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
                  onClick={() => {
                    toggleAnalysis('Not Bug')
                    setNotBugHandler()
                  }}
                  className="analysis-btn"
                >
                  Not Bug
                </Button>
                <Button
                  type={localData.Analysis === 'Outlier' ? 'primary' : 'default'}
                  onClick={() => {
                    toggleAnalysis('Outlier')
                    setOutlierHandler()
                  }}
                  className="analysis-btn"
                >
                  Outlier
                </Button>
              </div>
      
              {localData.Analysis === 'Bug' && localData?.Validation && (
                <div className="bug-fields">
                  <div className="form-field">
                    <label>Expected Classes</label>
                    <Select
                      mode="multiple"
                      options={expectedClassesOptions}
                      value={selectedExpectedClasses}
                      onChange={(val) => {
                        handleChange('ExpectedClasses', val)
                        setSelectedExpectedClasses(val)
                      }}
                      placeholder="Select Expected classes"
                      className="input-field expected-classes-select"
                      style={{ width: '100%' }}
                    />
                  </div>
      
                  <div className="form-field">
                    <label>Reproduced Bugs URLs</label>
                    <Select
                      mode="tags"
                      placeholder="Enter reproduced bugs urls..."
                      className="dark-styled-select input-field reproduced-urls-select"
                      value={reproducedUrls}
                      onChange={handleReproducedUrlChange}
                      style={{ width: '100%' }}
                      maxTagTextLength={25} /* Hard truncate at 25 chars (optional) */
                    />
                  </div>
      
                  <Button
                    onClick={handleValidateClick}
                    className='validation-btn'
                    disabled={validationLoading}
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