import React, { useRef, useState, useEffect, useCallback, version } from "react";
import { Select, InputNumber, Tabs, Button, Input } from "antd";
import "../css/resizeable-tabs.css";
import "antd/dist/reset.css"; // Antd's CSS reset (add once in your project)
import { fetchModels, getAllVersions, getModelClasses, startTask } from "../util-api/api";

function Task() {
  const [filters, setFilters] = useState([]);
  const [filterVersions, setFilterVersions] = useState([]);

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Classes Multi-Select State
  const [classes, setClasses] = useState([]); // API data
  const [selectedClassesData, setSelectedClassesData] = useState({}); // { classId: { lowerLimit, upperLimit, label }, ... }
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [folderName, setFolderName] = useState('')

  const [maxSize, setMaxSize] = useState();
  const [minSize, setMinSize] = useState();
  const [size, setSize] = useState();

  const [prompts, setPrompts] = useState([]);
  const [urls, setUrls] = useState([]);

  const [submitterEmail, setSubmitterEmail] = useState('jayasuryas217@gmail.com')
  const [submitterPhoneNumber, setSubmitterPhoneNumber] = useState('+918867808005')
  const [agents, setAgents] = useState([
    '1001GEC',
    '1002YOR',
    '1003BEC',
    '1004BGT'
  ])
  const [selectedAgentId, setselectedAgentId] = useState('1001GEC')

  const containerRef = useRef(null);
  const [leftPercent, setLeftPercent] = useState(50); // Start with 50% width

  const [startTaskResponse, setStartTaskResponse] = useState('')

  useEffect(() => {
    console.log('start task response', startTaskResponse)
  }, [startTaskResponse])

  const isDragging = useRef(false);

  const onMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    let newLeft = ((e.clientX - rect.left) / rect.width) * 100;
    // Clamp between 10% and 90% for usability
    newLeft = Math.max(10, Math.min(90, newLeft));
    setLeftPercent(newLeft);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "default";
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line
  }, []);

  // Fetch classes when both filter and version are selected
  useEffect(() => {

    const init = async () => {
      if (selectedFilter && selectedVersion) {
        setIsLoadingClasses(true);

        const response = await getModelClasses(selectedFilter)

        setClasses(
          response.map((item) => ({
            label: item,
            value: item
          }))
        )
        setIsLoadingClasses(false)
      } else {
        // Clear classes if no filter/version selected
        setClasses([]);
        setSelectedClassesData({});
      }
    }

    init()
  }, [selectedFilter, selectedVersion, setClasses, setIsLoadingClasses, getModelClasses]);

  useEffect(() => {
    const init = async () => {
      const response = await fetchModels();

      setFilters(response)
    }

    init()
  }, [fetchModels, setFilters])

  useEffect(() => {
    const init = async () => {
      if(selectedFilter){
        const response = await getAllVersions(selectedFilter)
        setFilterVersions(response)
      }
    }

    init()
  }, [setFilterVersions, getAllVersions, selectedFilter])

  const handleClassChange = (newSelectedClasses) => {
    const newSelectedClassesData = { ...selectedClassesData };
    newSelectedClasses.forEach((classId) => {
      if (!newSelectedClassesData[classId]) {
        const selectedClass = classes.find((c) => c.value === classId);
        newSelectedClassesData[classId] = {
          lowerLimit: 0.5,
          upperLimit: 1.0,
          label: selectedClass?.label || "",
        };
      }
    });

    // Remove data for unselected classes
    Object.keys(selectedClassesData).forEach((classId) => {
      if (!newSelectedClasses.includes(classId)) {
        delete newSelectedClassesData[classId];
      }
    });

    setSelectedClassesData(newSelectedClassesData);
  };

  const handleLimitChange = (classId, limitType, value) => {
    setSelectedClassesData((prevData) => ({
      ...prevData,
      [classId]: {
        ...prevData[classId],
        [limitType]: value,
      },
    }));
  };

  const selectedClassValues = Object.keys(selectedClassesData);


  // Handle prompt changes
  const handlePromptChange = (index, value) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };


  // Handle adding a new prompt
  const handleAddPrompt = () => {
    if(!prompts.includes("")){
      setPrompts([...prompts, ""]);
    }
  };


  // Handle removing a prompt
  const handleRemovePrompt = (index) => {
    const newPrompts = [...prompts];
    newPrompts.splice(index, 1);
    setPrompts(newPrompts);
  };


  // Handle URL changes
  const handleURLChange = (index, value) => {
    const newURLs = [...urls];
    newURLs[index] = value;
    setUrls(newURLs);
  };


  // Handle adding a new URL
  const handleAddURL = () => {
    if(!urls.includes("")){
      setUrls([...urls, ""]);
    }
  };


  // Handle removing a URL
  const handleRemoveURL = (index) => {
    const newURLs = [...urls];
    newURLs.splice(index, 1);
    setUrls(newURLs);
  };

  const handleSubmit = useCallback(async () => {
    const data = {
      "model": selectedFilter,
      "version": selectedVersion,
      "folder_name": folderName,
      "maxsize": maxSize,
      "minsize": minSize,
      "size": size,
      "class_type": Object.fromEntries(Object.entries(selectedClassesData).map(([k, v]) => [k, [v.lowerLimit, v.upperLimit]])),
      "prompt": prompts.filter(item => item !== ""),
      "url": urls.filter(item => item !== ""),
      "submitter_email": submitterEmail,
      "submitter_phone_number": submitterPhoneNumber,
      "agent_id": selectedAgentId
    }

    console.log("Start Task Input Data", data)

    const response = await startTask(data)
    setStartTaskResponse(response.data)
  }, [
    selectedFilter, 
    selectedVersion, 
    folderName, 
    maxSize, 
    minSize, 
    size, 
    selectedClassesData, 
    prompts, 
    urls, 
    submitterEmail, 
    submitterPhoneNumber, 
    selectedAgentId,
    startTask,
    setStartTaskResponse
  ])

  const tabTwoItems = [
    {
      key: "collectors",
      label: "Collectors",
      children: <CollectorsTab 
        selectedAgentId={selectedAgentId}
        startTaskResponse={startTaskResponse}
      />,
    },
    {
      key: "tester",
      label: "Tester",
      children: <TesterTab />,
    },
    {
      key: "reproducers",
      label: "Reproducers",
      children: <ReproducersTab />,
    },
  ];

  return (
    <div className="container" ref={containerRef}>
      <div className="tab left" style={{ width: `${leftPercent}%` }}>
        <div className="tab-controls">
          {/* ... (rest of your Tab 1 content) ... */}
          <div className="dropdown-container">
            <select
              className="dropdown"
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setSelectedVersion(null); // Reset version when filter changes
              }}
            >
              <option value="">-- Select Filter --</option>

              {filters && Array.isArray(filters) && filters.map((filter, i) => {
                return <option key={i} value={filter}>{filter}</option>
              })}

            </select>

            <select
              className="dropdown"
              disabled={!selectedFilter}
              onChange={(e) => setSelectedVersion(e.target.value)}
            >
              <option value="">-- Select Version --</option>
              {selectedFilter && filterVersions && Array.isArray(filterVersions) && (
                <>
                  {
                    filterVersions.map((each, i) => {
                      return <option value={each} key={i}>{each}</option>
                    })
                  }
                </>
              )}
            </select>

            <select
              className="dropdown"
              disabled={!agents}
              onChange={(e) => setselectedAgentId(e.target.value)}
            >
              <option value="">-- Select Agent --</option>
              {agents && Array.isArray(agents) && (
                <>{
                  agents.map((a, i) => {
                    return <option key={i} value={a}>{a}</option>
                  })
                }
                </>
              )}
            </select>
          </div>
          {selectedFilter && selectedVersion && (
            <div className="multi-select-container">
              <h3>Select Classes:</h3>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                className="class-select"
                placeholder="Select classes"
                value={selectedClassValues}
                onChange={handleClassChange}
                options={classes}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                loading={isLoadingClasses}
                notFoundContent={isLoadingClasses ? "Loading..." : "No classes found"}
              />
            </div>
          )}
          {selectedClassValues.length > 0 && (
            <div className="selection-display">
              <h4>Selected Classes with Limits:</h4>
              {selectedClassValues.map((classId) => (
                <div key={classId} className="selected-class-item">
                  <p>
                    <strong>{selectedClassesData[classId]?.label}</strong>
                  </p>
                  <div className="limit-inputs">
                    <label>
                      Lower Limit:
                      <InputNumber
                        min={0}
                        max={selectedClassesData[classId]?.upperLimit || 1}
                        step={0.01}
                        defaultValue={0.5}
                        value={selectedClassesData[classId]?.lowerLimit}
                        className="limit-input"
                        onChange={(value) =>
                          handleLimitChange(classId, "lowerLimit", value)
                        }
                      />
                    </label>
                    <label>
                      Upper Limit:
                      <InputNumber
                        min={selectedClassesData[classId]?.lowerLimit || 0}
                        max={1}
                        step={0.01}
                        defaultValue={1.0}
                        value={selectedClassesData[classId]?.upperLimit}
                        className="limit-input"
                        onChange={(value) =>
                          handleLimitChange(classId, "upperLimit", value)
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Folder Name */}
          <div>
            <label>Folder Name</label>
            <Input onChange={(e) => {
              setFolderName(e.target.value)
            }}/>
          </div>

          {/* New Size Inputs */}
          <div className="size-inputs">
            <label>
              Max Size:
              <InputNumber min={0} style={{ width: "100%", color: "white" }} color="white" onChange={setMaxSize}/>
            </label>
            <label>
              Min Size:
              <InputNumber min={0} style={{ width: "100%", color: "white" }} onChange={setMinSize}/>
            </label>
            <label>
              Size:
              <InputNumber min={0} style={{ width: "100%", color: "white" }} onChange={setSize}/>
            </label>
          </div>

          {/* Prompts */}

          <div style={{paddingBottom: "20px"}}>
             <label style={{paddingRight: "20px", paddingBottom: "10px"}}>Prompts:</label>
             {prompts.map((prompt, index) => (
               <div key={index} className="text-area-container">
                 <Input.TextArea
                   value={prompt}
                   onChange={(e) => handlePromptChange(index, e.target.value)}
                   className="add-prompt-input"
                   placeholder="Enter prompt"
                 />
                 <Button type="danger" onClick={() => handleRemovePrompt(index)}>
                   Remove
                 </Button>
               </div>
             ))}
             <Button type="primary" onClick={handleAddPrompt}>
               Add Prompt
             </Button>
           </div>

           <div>
             <label style={{paddingRight: "20px"}}>URLs:</label>
             {urls.map((url, index) => (
               <div key={index} className="text-area-container">
                 <Input.TextArea
                   value={url}
                   onChange={(e) => handleURLChange(index, e.target.value)}
                   className="add-url-input"
                   placeholder="Enter url"
                 />
                 <Button type="danger" color="black" onClick={() => handleRemoveURL(index)}>
                   Remove
                 </Button>
               </div>
             ))}
             <Button type="primary" onClick={handleAddURL}>
               Add Url
             </Button>
           </div>

        </div>

        <Button type="primary" onClick={handleSubmit}>
           Submit
         </Button>
      </div>
      <div
        className="resizer"
        onMouseDown={onMouseDown}
        tabIndex={0}
        aria-label="Resize tabs"
        role="separator"
      />
      <div className="tab right" style={{ width: `${100 - leftPercent}%` }}>
        <Tabs defaultActiveKey="collectors" items={tabTwoItems} />
      </div>
    </div>
  );
}

export default Task;


// Component for the Collectors Tab
function CollectorsTab({ selectedAgentId, startTaskResponse }) {

  useEffect(() => {
    console.log('start task response', startTaskResponse)
  }, [startTaskResponse])

  return (
    <div className="tab-content">
      <h3>Collectors</h3>
      <p>Content for the Collectors tab.</p>
        {selectedAgentId && (
          <div className="selection-display">
            <h3>Agent Details</h3>
            <h4>Agent ID: {selectedAgentId}</h4>
          </div>
        )}

        {/* Parsing Start Task Response */}
        {startTaskResponse && 
          <div>
          <h2>Task Details</h2>
          <div class="task-info">
            <p><strong>Message:</strong> <span class="message">{startTaskResponse?.message}</span></p>
          </div>
        
          <h3>Task Information</h3>
          <div class="task-details">
            <p><strong>ID:</strong> <span>{startTaskResponse?.task?._id}</span></p>
            <p><strong>Agent ID:</strong> <span>{startTaskResponse?.task?.agent_id}</span></p>
            <p><strong>Class Type:</strong></p>
            {/* <ul class="class-type">
              <li><strong>yes_bra:</strong>
                <ul>
                  <li><span>{startTaskResponse?.task?.class_type?.yes_bra[0]}</span></li>
                  <li><span>{startTaskResponse?.task?.class_type?.yes_bra[1]}</span></li>
                </ul>
              </li>
            </ul> */}
            <p><strong>Folder Name:</strong> <span>{startTaskResponse?.task?.folder_name}</span></p>
            <p><strong>Max Size:</strong> <span>{startTaskResponse?.task?.maxsize}</span></p>
            <p><strong>Min Size:</strong> <span>{startTaskResponse?.task?.minsize}</span></p>
            <p><strong>Model:</strong> <span>{startTaskResponse?.task?.model}</span></p>
            <p><strong>Progress:</strong> <span>{startTaskResponse?.task?.progress}</span></p>
            <p><strong>Prompt:</strong></p>
            <ul class="prompt-list">
              {startTaskResponse?.task?.prompt.map((item, index) => (
                <li key={index}><span>{item}</span></li>
              ))}
            </ul>
            <p><strong>Size:</strong> <span>{startTaskResponse?.task?.size}</span></p>
            <p><strong>Status:</strong> <span class={`status ${startTaskResponse?.task?.status.toLowerCase()}`}>{startTaskResponse?.task?.status}</span></p>
            <p><strong>Submitter Email:</strong> <span>{startTaskResponse?.task?.submitter_email}</span></p>
            <p><strong>Submitter Phone Number:</strong> <span>{startTaskResponse?.task?.submitter_phone_number}</span></p>
            <p><strong>URL:</strong></p>
            <ul class="url-list">
              {startTaskResponse?.task?.url.length > 0 ? (
                startTaskResponse?.task?.url.map((item, index) => (
                  <li key={index}><span>{item}</span></li>
                ))
              ) : (
                <span>No URLs provided.</span>
              )}
            </ul>
            <p><strong>Version:</strong> <span>{startTaskResponse?.task?.version}</span></p>
          </div>
        </div>
        }
      {/* Add your Collectors specific UI elements here */}
    </div>
  );
}

// Component for the Tester Tab
function TesterTab() {
  return (
    <div className="tab-content">
      <h3>Tester</h3>
      <p>Content for the Tester tab.</p>
      {/* Add your Tester specific UI elements here */}
    </div>
  );
}

// Component for the Reproducers Tab
function ReproducersTab() {
  return (
    <div className="tab-content">
      <h3>Reproducers</h3>
      <p>Content for the Reproducers tab.</p>
      {/* Add your Reproducers specific UI elements here */}
    </div>
  );
}