import React, { useCallback, useEffect, useState } from "react";
import { Input, Button } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import "../styles.css";
import { getExpectedScore, startProcess } from "../util-api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ModelsDropdown from "../components/ModelsDropdown";

const FreshLoadTest = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [emails, setEmails] = useState("");
  const [expectedScore, setExpectedScore] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const response = await getExpectedScore();
      setExpectedScore(response);
    };
    init();
  }, []);

  // Handle email change
  const handleEmailChange = useCallback((e) => {
    setEmails(e.target.value);
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedModel || !selectedVersion || !emails) {
      toast.error("Please fill all the fields");
      return;
    }

    const emailList = emails.split(",").map((email) => email.trim());

    const response = await startProcess(
      selectedVersion,
      selectedModel,
      emailList,
      expectedScore
    );

    if (response.status === 200) {
      toast.success("Process started successfully");
    } else if (response.status === 409) {
      toast.error("Process already exists");
    } else {
      toast.error("Failed to start process");
    }
  };

  return (
    <div className="dark-app-container">
      <div className="dark-form-card">
        <h2 className="dark-form-title">Fresh Load Test Configuration</h2>
        <div className="dark-form-content">
          {/* Model and Version Selection */}
          <div className="dark-input-group">
            <label className="dark-input-label">Select Model and Version</label>
            <ModelsDropdown
              selectedModel={selectedModel}
              selectedVersion={selectedVersion}
              onModelChange={setSelectedModel}
              onVersionChange={setSelectedVersion}
            />
          </div>

          {/* Email Input */}
          <div className="dark-input-group">
            <label className="dark-input-label">
              Email Recipients (comma-separated)
            </label>
            <Input
              placeholder="Enter email addresses..."
              value={emails}
              onChange={handleEmailChange}
              className="dark-styled-input"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={handleSubmit}
            className="dark-submit-button"
            disabled={!selectedModel || !selectedVersion || !emails}
          >
            Start Process
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreshLoadTest;
