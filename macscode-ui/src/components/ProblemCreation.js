import React, { useState, useEffect, useRef } from 'react';
import TopBar from "./TopBar";
import '../styles/ProblemCreation.css';
import '../styles/Difficulty.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLocation } from 'react-router-dom';

const ProblemCreation = () => {
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [newTopic, setNewTopic] = useState('');
    const [difficulty, setDifficulty] = useState("Easy");
    const [problemType, setProblemType] = useState("JAVA");
    const [mainFile, setMainFile] = useState(null);
    const [solutionFile, setSolutionFile] = useState(null);
    const [testCases, setTestCases] = useState([{ input: null, output: null }]);
    const [viewFile, setViewFile] = useState(null);
    const [viewFileContent, setViewFileContent] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [showOutputFiles, setShowOutputFiles] = useState(false);
    const popupRef = useRef(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const draftId = queryParams.get('id');
    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const response = await fetch('/problems-service/authors/drafts');
                const drafts = await response.json();
                if (draftId) {
                    const draft = drafts.find(d => d.id === draftId);
                    if (draft) {
                        populateFields(draft);
                    }
                } else {
                    // Handle case where there's no specific draft ID
                }
            } catch (error) {
                console.error('Error fetching drafts:', error);
            }
        };

        fetchDrafts();
    }, [draftId]);

    const populateFields = (draft) => {
        console.log(draft)
        setSelectedTopics(draft.topics || []);
        setNewTopic('');
        setDifficulty(draft.difficulty || "Easy");
        setProblemType(draft.problemType || "JAVA");
        setMainFile(draft.mainFile || null);
        setSolutionFile(draft.solutionFile || null);
        setTestCases(draft.testCases || [{ input: null, output: null }]);
        setShowOutputFiles(draft.showOutputFiles || false);
    };

    const handleCheckboxChange = () => {
        setShowOutputFiles(prevState => !prevState);
    };

    const handleTopicsChange = (event) => {
        setNewTopic(event.target.value);
    };

    const addTopic = () => {
        if (newTopic.trim() !== '' && !selectedTopics.includes(newTopic.trim())) {
            setSelectedTopics([...selectedTopics, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleDifficultyChange = (event) => {
        setDifficulty(event.target.value);
    };

    const handleProblemTypeChange = (event) => {
        setProblemType(event.target.value);
        setMainFile(null);
        setSolutionFile(null);
    };

    const handleFileChange = (event, fileType) => {
        const file = event.target.files[0];
        if (file) {
            if (fileType === 'main') {
                setMainFile(file);
            } else if (fileType === 'solution') {
                setSolutionFile(file);
            }
        }
    };

    const handleViewFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setViewFileContent(reader.result);
                setShowPopup(true);
            };
            reader.readAsText(file);
            setSelectedLanguage(getFileLanguage(file.name));
        }
    };

    const getFileLanguage = (fileName) => {
        if (problemType === 'CPP') return 'cpp';
        return 'java';
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                closePopup();
            }
        };

        if (showPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPopup]);

    const handleDeleteTestCase = (index) => {
        const updatedTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(updatedTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: null, output: null }]);
    };

    const handleTestCaseFileChange = (event, index, fileType) => {
        const file = event.target.files[0];
        if (file) {
            const updatedTestCases = [...testCases];
            updatedTestCases[index][fileType] = file;
            setTestCases(updatedTestCases);
        }
    };

    const handleViewTestCaseFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setViewFileContent(reader.result);
                setShowPopup(true);
            };
            reader.readAsText(file);
            setSelectedLanguage(getFileLanguage(file.name));
        }
    };

    return (
        <div className="problem-creation-container">
            <TopBar />
            <h1 className="problem-creation-title">Problem Creation Page</h1>
            <form className="problem-creation-form">
                <div className="form-group">
                    <label className="form-label" htmlFor="problemName">Problem Name</label>
                    <input type="text" id="problemName" className="form-control" placeholder="Enter problem name" />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="problemDescription">Problem Description</label>
                    <textarea id="problemDescription" className="form-control" rows="4" placeholder="Enter problem description"></textarea>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="problemType">Type</label>
                    <select
                        id="problemType"
                        className="form-control"
                        value={problemType}
                        onChange={handleProblemTypeChange}
                    >
                        <option value="JAVA">JAVA</option>
                        <option value="CPP">CPP</option>
                        <option value="KAREL">KAREL</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="difficulty">Difficulty</label>
                    <select
                        id="difficulty"
                        className={`form-control difficulty ${difficulty.toLowerCase()}`}
                        value={difficulty}
                        onChange={handleDifficultyChange}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="topics">Topics</label>
                    <div className="topic-input-container">
                        <input
                            type="text"
                            id="topics"
                            className="form-control topic-input"
                            placeholder="Add a topic"
                            value={newTopic}
                            onChange={handleTopicsChange}
                            onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                        />
                        <button type="button" className="add-topic-button" onClick={addTopic}>Add Topic</button>
                    </div>
                    <ul className="topics-list">
                        {selectedTopics.map((topic, index) => (
                            <li key={index} className="topics-list-item">{topic}</li>
                        ))}
                    </ul>
                </div>
                {problemType !== 'KAREL' && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="mainFile">Main File</label>
                        <div className="file-input-container">
                            <input
                                type="file"
                                id="mainFile"
                                className="form-control"
                                onChange={(e) => handleFileChange(e, 'main')}
                            />
                            {mainFile && (
                                <button type="button" className="view-file-button" onClick={() => handleViewFile(mainFile)}>
                                    View
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label" htmlFor="solutionFile">Solution File</label>
                    <div className="file-input-container">
                        <input
                            type="file"
                            id="solutionFile"
                            className="form-control"
                            onChange={(e) => handleFileChange(e, 'solution')}
                        />
                        {solutionFile && (
                            <button type="button" className="view-file-button" onClick={() => handleViewFile(solutionFile)}>
                                View
                            </button>
                        )}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Test Cases</label>
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="showOutputFiles"
                            className="checkbox-input"
                            checked={showOutputFiles}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="showOutputFiles" className="checkbox-label">Include Output Files</label>
                    </div>

                    <div className="test-cases-container">
                        {testCases.map((testCase, index) => (
                            <div key={index} className="test-case-container">
                                <div className="test-case-files">
                                    <span className="test-case-number">{index + 1}.</span>
                                    <div className="form-group">
                                        <label className="form-label">Input File</label>
                                        <div className="file-input-container">
                                            <input
                                                type="file"
                                                className="form-control"
                                                onChange={(e) => handleTestCaseFileChange(e, index, 'input')}
                                            />
                                            {testCase.input && (
                                                <button type="button" className="view-file-button"
                                                        onClick={() => handleViewTestCaseFile(testCase.input)}>
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {showOutputFiles && (
                                        <div className="form-group">
                                            <label className="form-label">Output File</label>
                                            <div className="file-input-container">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={(e) => handleTestCaseFileChange(e, index, 'output')}
                                                />
                                                {testCase.output && (
                                                    <button type="button" className="view-file-button"
                                                            onClick={() => handleViewTestCaseFile(testCase.output)}>
                                                        View
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <button
                                            type="button"
                                            className="delete-test-case-button"
                                            onClick={() => handleDeleteTestCase(index)}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-test-case-button" onClick={addTestCase}>
                            + Add Test Case
                        </button>
                    </div>


                </div>
                <div className="form-group">
                <button type="submit" className="submit-button">Submit</button>
                </div>
            </form>
            {showPopup && (
                <div className="code-popup">
                    <div className="code-popup-content" ref={popupRef}>
                        <SyntaxHighlighter language={selectedLanguage} style={dracula}>
                            {viewFileContent}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemCreation;
