import React, { useState } from "react";
import { Select, Input, Button } from "antd";
import { 
    CaretDownOutlined, 
    RocketOutlined, 
    CodeOutlined, 
    ThunderboltOutlined 
} from '@ant-design/icons';
import '../styles.css'


const { Option } = Select;

// Mock data for models and versions
const modelsData = {
    "Model A": ["v1.0", "v1.1", "v1.2"],
    "Model B": ["v2.0", "v2.1"],
    "Model C": ["v3.0", "v3.1", "v3.2", "v3.3"],
};

const FreshLoadTest = () => {
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [emails, setEmails] = useState("");

    // Handle model change
    const handleModelChange = (value) => {
        setSelectedModel(value);
        setSelectedVersion(null); // Reset version on model change
    };

    // Handle form submission
    const handleSubmit = () => {
        console.log("Model:", selectedModel);
        console.log("Version:", selectedVersion);
        console.log("Emails:", emails);
    };

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
                            dropdownClassName="dark-dropdown-menu"
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
                            dropdownClassName="dark-dropdown-menu"
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
                        <Input.TextArea
                            placeholder="user1@example.com, user2@example.com"
                            className="dark-styled-textarea"
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            rows={4}
                        />
                        <div className="dark-input-hint">Separate multiple emails with commas</div>
                    </div>
    
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
