import React, { useCallback, useEffect, useState } from "react";
import { Select, Input, Button } from "antd";
import { 
    CaretDownOutlined, 
    RocketOutlined, 
    CodeOutlined, 
    ThunderboltOutlined 
} from '@ant-design/icons';

import '../styles.css';
import { fetchModels, startProcess } from "../util-api/api";
import toast from 'react-hot-toast';
import axios from "axios";

const { Option } = Select;

const FreshLoadTest = () => {
    const [modelsData, setModelsData] = useState({});
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [emails, setEmails] = useState([]);
    const [threshold, setThreshold] = useState("0.5")

    useEffect(() => {
        const init = async () => {
            try {
                const response = await axios.get("http://localhost:5000/utilities/analysis/get-threshold")
                    .then(res => res.data)
    
                setThreshold(response?.threshold || "0.5")
            } catch(err) {
                console.error("Cannot Fetch Threshold", err)
            }
        }

        init()
    }, [axios, setThreshold])

    useEffect(() => {
        const init = async () => {
            setModelsData(await fetchModels())
        }
        init()
    }, [fetchModels, setModelsData])

    // Handle model change
    const handleModelChange = (value) => {
        setSelectedModel(value);
        setSelectedVersion(null); // Reset version on model change
    };

    const handleEmailChange = useCallback((e) => {
        setEmails(e)
    }, [setEmails])

    // Handle form submission

    const handleSubmit = useCallback(async () => {
        const response = await startProcess(selectedVersion, selectedModel, emails)
        
        if(response.status == 202 || response.status == 200){
            toast.success(response.data?.message || "Process Started")
        } else if(response.status == 409 || response.status == 400) {
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
    }, [selectedVersion, selectedModel, emails])

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
                            suffixIcon={<CaretDownOutlined className="dark-dropdown-icon" />}
                            // dropdownClassName="dark-dropdown-menu"
                        >
                            {Object.keys(modelsData).map((model) => (
                                <Option key={model} value={model}>
                                    <div className="dark-option-content">
                                        <RocketOutlined className="dark-option-icon" />
                                        <span>{model}</span>
                                    </div>
                                </Option>
                            ))}
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
                                modelsData[selectedModel].map((version) => (
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

                    {/* Set Threshold */}
                    <div className="dark-input-group">
                        <label className="dark-input-label">Set Threshold</label>
                        <Input
                            placeholder="Set Threshold"
                            className="input-field dark-styled-select"
                            value={threshold}
                            onChange={(e) => {
                                setThreshold(e.target.value)
                            }}
                        />
                    </div>
                    <div className="dark-input-hint">{"0 < threshold <= 1"}</div>
    
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
