import React, { useCallback, useEffect, useState } from 'react';
import { Card, Button, Select, Input, Typography, message, Tag, Spin } from 'antd';
import { ExpandOutlined, LinkOutlined } from '@ant-design/icons';
import '../css/analysis-card.css'
import axios from 'axios';
import toast from 'react-hot-toast';
import { analysisCardHandleChange, getChunkData, proofValidation, setNotBug, setOutlier } from '../util-api/api';
import { parse } from 'papaparse';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AnalysisCard = ({ data, onUpdate, expectedClasses, analysts, onPreview, chunk, expectedScore }) => {
    const [localData, setLocalData] = useState(data);
    const [predictionClasses, setPredictionClasses] = useState(null)
    const [reproducedUrls, setReproducedUrls] = useState([])
    const [selectedExpectedClasses, setSelectedExpectedClasses] = useState([])
    const [expectedClassesOptions, setExpectedClassesOptions] = useState([])
    const [validationLoading, setValidationLoading] = useState(false)
    const [parsedPredictedClasses, setParsedPredictedClasses] = useState({})
    const [selectedButton, setSelectedButton] = useState('')
    const [bugDropDown, setBugDropDown] = useState(false)

    useEffect(() => {
      console.log("Local Data", localData)
      setSelectedButton(localData["Analysis"])
    }, [localData, setSelectedButton])

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

    const handleValidateClick = useCallback(async () => {
        setValidationLoading(true)
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
            toast.success(`Validated ${data["inputMediaUrl"]}`)
        } else {
            toast.error(`Cannot Validate ${data["inputMediaUrl"]}`)
        }
        console.log("Validation Response", response)
        console.log("IU", response?.invalid_urls)
        console.log("IUL", response?.invalid_urls?.length)

        const refetchedData = await getChunkData(chunk, data["inputMediaUrl"])
        console.log("Refetched Data", refetchedData)
        setLocalData(refetchedData?.data[0])

        setValidationLoading(false)
        setBugDropDown(false)
    }, [data, reproducedUrls, selectedExpectedClasses, setValidationLoading, setBugDropDown, setLocalData])

    const handleReproducedUrlChange = useCallback((e) => {
        setReproducedUrls(e)
    }, [setReproducedUrls])

    const setNotBugHandler = useCallback(() => {
        const init = async () => {
            setSelectedButton('Not Bug')
            console.log("URL", data['inputMediaUrl'])
            console.log("chunk", chunk)
            const response = await setNotBug(chunk, data["inputMediaUrl"])

            const refetchedData = await getChunkData(chunk, data["inputMediaUrl"])
            console.log("Refetched Data", refetchedData)
            setLocalData(refetchedData?.data[0])
        }

        init()
    }, [data, chunk, setSelectedButton, setLocalData, getChunkData])

    const setOutlierHandler = useCallback(() => {
        const init = async () => {
            setSelectedButton('Outlier')
            console.log("URL", data['inputMediaUrl'])
            console.log("chunk", chunk)
            const response = await setOutlier(chunk, data["inputMediaUrl"])

            const refetchedData = await getChunkData(chunk, data["inputMediaUrl"])
            console.log("Refetched Data", refetchedData)
            setLocalData(refetchedData?.data[0])
        }

        init()
    }, [data, chunk, setSelectedButton, setLocalData, getChunkData])

    useEffect(() => {
      try {
        const jsonString = data['Predicted Classes'].replace(/'/g, '"'); // Replace single quotes with double quotes
        const parsedData = JSON.parse(jsonString);
        setParsedPredictedClasses(parsedData)
      } catch (error) {
        console.error('Error parsing Predicted Classes:', error);
        setParsedPredictedClasses({})
      }
    }, [data, setParsedPredictedClasses]);
    

    return (
      <div className="analysis-card">
        <div className="image-section">
          <img
            src={data["inputMediaUrl"]}
            alt="Preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23111'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='12' fill='%23888' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="image-actions">
            <Button icon={<ExpandOutlined />} onClick={() => onPreview(data["inputMediaUrl"])} />
            <Button icon={<LinkOutlined />} onClick={copyImageUrl} />
          </div>
        </div>
  
        <div className="card-info">
          <p><span>Result:</span> {data["Result"] || "-"}</p>
          <p><span>Projection:</span> {data["Projection Layer"] || "-"}</p>
          <p><span>Detection:</span> {data["Detection Layer"] || "-"}</p>
          <div className="predictions">
            <span>Prediction:</span>
            {Object.keys(parsedPredictedClasses).length > 0 ? (
              Object.entries(parsedPredictedClasses).map(([key, value]) => (
                <span
                  key={key}
                  style={{
                    color: Number(value) >= Number(expectedScore) ? "#32CD32" : "#FF3737",
                    display: "block",
                  }}
                >
                  {key}: {value.toFixed(4)}
                </span>
              ))
            ) : (
              <span>-</span>
            )}
          </div>
  
          <div className="analysis-actions">
            {/* {["Bug", "Not Bug", "Outlier"].map((label) => (
              <Button
                key={label}
                type={localData.Analysis === label ? "primary" : "default"}
                onClick={() => toggleAnalysis(label)}
              >
                {label}
              </Button>
            ))} */}
            <Button
              type={selectedButton === "Bug" ? "primary": "default"}
              onClick={() => {
                setBugDropDown(true)
                setSelectedButton("Bug")
              }}
            >
              Bug
            </Button>
            <Button
              type={selectedButton === "Not Bug" ? "primary": "default"}
              onClick={setNotBugHandler}
            >
              Not Bug
            </Button>
            <Button
              type={selectedButton === "Outlier" ? "primary": "default"}
              onClick={setOutlierHandler}
            >
              Outlier
            </Button>
          </div>
  
          {bugDropDown && (
            <div className="bug-section">
              <div className="form-group">
                <label>Expected Classes</label>
                <Select
                  mode="multiple"
                  value={selectedExpectedClasses}
                  onChange={(val) => {
                    handleChange("ExpectedClasses", val);
                    setSelectedExpectedClasses(val);
                  }}
                  options={expectedClassesOptions}
                  placeholder="Select Expected Classes"
                  style={{ width: "100%" }}
                />
              </div>
  
              <div className="form-group">
                <label>Reproduced Bug URLs</label>
                <Select
                  mode="tags"
                  placeholder="Enter URLs"
                  value={reproducedUrls}
                  onChange={handleReproducedUrlChange}
                  style={{ width: "100%" }}
                />
              </div>
  
              {validationLoading ? (
                <Spin />
              ) : (
                <Button onClick={handleValidateClick} className="validate-btn">
                  Validate
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
      
};

export default AnalysisCard;