import React, { useCallback, useEffect, useState } from "react";
import { Select, Input, Button } from "antd";
import { 
    CaretDownOutlined, 
    RocketOutlined, 
    CodeOutlined, 
    ThunderboltOutlined 
} from '@ant-design/icons';

import '../styles.css';
import { fetchModels, getAllVersions, getExpectedScore, startProcess } from "../util-api/api";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const FreshLoadTest = () => {
    const [models, setModels] = useState([]);
    const [modelVersions, setModelVersions] = useState([])
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [emails, setEmails] = useState([]);
    const [expectedScore, setExpectedScore] = useState("0.5")
    const navigate = useNavigate()

    useEffect(() => {
        const init = async () => {
            try {
                const response = await getExpectedScore()
    
                setExpectedScore(response['expected-score'] || "0.5")
            } catch(err) {
                console.error("Cannot Fetch Expected Score", err)
            }
        }

        init()
    }, [setExpectedScore])

    useEffect(() => {
        const init = async () => {
            setModels(await fetchModels())
        }
        init()
    }, [fetchModels, setModels])

    useEffect(() => {
        const init = async () => {

            const response = await getAllVersions(selectedModel)

            setModelVersions(response)
        }

        selectedModel && init()
    }, [setModelVersions, selectedModel])

    // Handle model change
    const handleModelChange = (value) => {
        console.log("Handle Model Change", value)
        setSelectedModel(value);
        setSelectedVersion(null); // Reset version on model change
    };

    const handleEmailChange = useCallback((e) => {
        setEmails(e)
    }, [setEmails])

    // Handle form submission

    const handleSubmit = useCallback(async () => {
        if(selectedModel, selectedVersion, emails, expectedScore){
            const response = await startProcess(selectedVersion, selectedModel, emails, expectedScore)
        
            if(response.status == 202 || response.status == 200){
                toast.success(response.data?.message || "Process Started")
            } else if(response?.status == 409) {
                navigate('/login')
            } else if(response.status == 400) {
                console.log(response.data)
                toast.error(response.data.message)
                if(response.status == 400){
    
                    response?.data?.errors?.map((each, i) => {
                        toast.error(each)
                    })
                }
            } else {
                toast.error("Cannot Start Process")
            }
        }
    }, [selectedVersion, selectedModel, emails, expectedScore])

    return (
        <div className="dark-app-container">
            <div className="dark-form-card">
                <h2 className="dark-form-title">Fresh Load Test Configuration</h2>
                <div className="dark-form-content">
                    {/* Models Dropdown */}
                    <div className="dark-input-group">
                        <label className="dark-input-label">Select Model</label>
                        <Select
                            placeholder="Choose a model..."
                            className="dark-styled-select"
                            onChange={handleModelChange}
                            value={selectedModel}
                            // filterOption={modelsData?.map(each => ({ label: each, value: each }))}
                            suffixIcon={<CaretDownOutlined className="dark-dropdown-icon" />}
                            // dropdownClassName="dark-dropdown-menu"
                        >
                            {Array.isArray(models) && models?.map((model, i) => {
                                return (
                                <Option key={model} value={model}>
                                    <div className="dark-option-content">
                                        <RocketOutlined className="dark-option-icon" />
                                        <span>{model}</span>
                                    </div>
                                </Option>
                            )})}
                        </Select>
                    </div>

                    {/* Versions Dropdown */}
                    <div className="dark-input-group">
                        <label className="dark-input-label">Select Version</label>
                        <Select
                            placeholder="Choose a version..."
                            className="dark-styled-select"
                            value={selectedVersion}
                            onChange={setSelectedVersion}
                            disabled={!selectedModel}
                            suffixIcon={<CaretDownOutlined className="dark-dropdown-icon" />}
                            // dropdownClassName="dark-dropdown-menu"
                        >
                            {selectedModel &&
                                Array.isArray(modelVersions) &&
                                modelVersions.map((version) => (
                                    <Option key={version} value={version}>
                                        <div className="dark-option-content">
                                            <CodeOutlined className="dark-option-icon" />
                                            <span>{version}</span>
                                        </div>
                                    </Option>
                                ))}
                        </Select>
                    </div>

                    {/* Gmail Input */}
                    <div className="dark-input-group">
                        <label className="dark-input-label">Email Addresses</label>
                        <Select
                            mode="tags"
                            placeholder="Enter email addresses..."
                            className="dark-styled-select"
                            value={emails}
                            onChange={handleEmailChange}
                        />
                        <div className="dark-input-hint">Press Enter to add multiple emails</div>
                    </div>

                    {/* Set ExpectedScore */}
                    <div className="dark-input-group">
                        <label className="dark-input-label">Set Expected Score</label>
                        <Input
                            placeholder="Set ExpectedScore"
                            className="input-field dark-styled-select"
                            value={expectedScore}
                            onChange={(e) => {
                                setExpectedScore(e.target.value)
                            }}
                        />
                    </div>
                    <div className="dark-input-hint">{"0 < expectedScore <= 1"}</div>
    
                    {/* Submit Button */}
                    <Button 
                        type="secondary" 
                        onClick={handleSubmit} 
                        className="dark-submit-btn"
                        icon={<ThunderboltOutlined />}
                        size="large"
                    >
                        Execute Load Test
                    </Button>
                </div>
            </div>
        </div>
    );

}
export default FreshLoadTest;
