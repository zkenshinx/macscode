import React, {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import ProblemDetails from './ProblemDetails';
import SolutionTemplate from './SolutionTemplate';
import TestCases from './TestCases';
import ResultsModal from './ResultsModal';
import Submissions from './Submissions';
import '../styles/Problem.css';
import {Client} from '@stomp/stompjs';
import '../styles/Karel.css';
import TopBar from './TopBar';
import Comments from './Comments';
import {v4 as uuidv4} from 'uuid';
import {jwtDecode} from 'jwt-decode';
import AllSubmissions from "./admin/AllSubmissions";

const Problem = () => {
    const {course, order} = useParams();
    const [problem, setProblem] = useState(null);
    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [responseReceived, setResponseReceived] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [userRole, setUserRole] = useState('');
    const [isDemo, setIsDemo] = useState(false);

    const clientRef = useRef(null);
    const discussionRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);
        }
    }, []);

    useEffect(() => {
        let webSocketURL;
        const isDevelopment = process.env.NODE_ENV === 'development';
        // Not good thing to do but whatever. TODO: change this in the future
        if (isDevelopment) {
            webSocketURL = `ws://localhost:8080/websocket-endpoint/websocket`;
        } else {
            const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            webSocketURL = `${protocol}${window.location.host}/problems-service/websocket-endpoint/websocket`;
        }

        clientRef.current = new Client({
            brokerURL: webSocketURL,
            reconnectDelay: 5000,
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        clientRef.current.activate();

        return () => {
            clientRef.current.deactivate();
        };
    }, []);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await axios.get(`/problems-service/problems/${course}/${order}`);
                setProblem(response.data);
                setCode(response.data.solutionFileTemplate);
                setTestCases(response.data.publicTestCases || []);
                setSelectedTestCase(response.data.publicTestCases[0]);
            } catch (error) {
                console.error('Error fetching problem', error);
                setError('Error fetching problem details. Please try again later.');
            }
        };

        fetchProblem();
    }, [course, order]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleShowDemo = () => {
        setIsDemo(true);
        handleRun(true);
    };

    const handleRun = (demoMode) => {
        setIsDemo(demoMode);
        if (!problem || isRunning) return;

        const submissionId = uuidv4();
        clientRef.current.subscribe(`/topic/runResult/${submissionId}`, (message) => {
            const runResults = JSON.parse(message.body);
            setResults(runResults);
            setResponseReceived(true);
            if (!demoMode) {
                setShowResults(true);
            }
            setIsRunning(false);
        });

        setIsRunning(true);
        clientRef.current.publish({
            destination: '/app/runSolution',
            body: JSON.stringify({
                problemId: problem.id,
                solution: code,
                submissionId: submissionId
            }),
        });
        setHasSubmitted(true);
        setResponseReceived(false);

        if (demoMode && results[selectedTestCase.testNum - 1].result === 'COMPILE_ERROR') {
            setShowResults(true);
        }
    };

    const handleSubmit = () => {
        setIsDemo(false);
        if (!problem || isSubmitting) return;

        const submissionId = uuidv4();
        clientRef.current.subscribe(`/topic/submitResult/${submissionId}`, (message) => {
            const submitResults = JSON.parse(message.body);
            setResults(submitResults);
            setResponseReceived(true);
            setShowResults(true);
            setIsSubmitting(false);
        });

        setIsSubmitting(true);
        clientRef.current.publish({
            destination: '/app/submitSolution',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                problemId: problem.id,
                solution: code,
                submissionId: submissionId
            }),
        });
        setHasSubmitted(true);
        setResponseReceived(false);
    };

    const handleCloseResults = () => {
        setShowResults(false);
    };

    const scrollToDiscussion = () => {
        const discussionElement = discussionRef.current;

        discussionElement.style.display = 'block';

        const topOffset = -10;
        const elementPosition = discussionElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - topOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    const handleTestCaseSelect = (testCase) => {
        setSelectedTestCase(testCase);
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!problem) {
        return <div>Loading...</div>;
    }

    return (
        <div className="problem-container">
            <TopBar/>
            <div className="content-container">
                <div className="problem-left">
                    <div className="tab-buttons">
                        <button
                            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            Submissions
                        </button>
                        {userRole === 'ADMIN' && (
                            <button
                                className={`tab-button ${activeTab === 'all-submissions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all-submissions')}
                            >
                                All Submissions
                            </button>
                        )}
                    </div>
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <ProblemDetails
                                problem={problem}
                                selectedTestCase={selectedTestCase}
                                results={results}
                                isDemo={isDemo}
                            />
                        )}
                        {activeTab === 'submissions' && <Submissions problemId={problem.id} />}
                        {activeTab === 'description' && <ProblemDetails problem={problem}/>}
                        {activeTab === 'submissions' && <Submissions problemId={problem.id}/>}
                        {activeTab === 'all-submissions' && userRole === 'ADMIN' && <AllSubmissions problemId={problem.id}/>}
                    </div>
                </div>
                <div className="problem-right">
                    <div className="problem-right-upper">
                        <SolutionTemplate
                            solutionFileTemplate={code}
                            onChange={handleCodeChange}
                        />
                        <div className="button-container">
                            <button
                                className="run-button"
                                onClick={() => handleRun(false)}
                                disabled={isRunning || isSubmitting}
                                style={{
                                    opacity: isRunning || isSubmitting ? 0.5 : 1,
                                    cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isRunning ? <div className="loading-spinner"></div> : 'Run'}
                            </button>
                            <button
                                className="submit-button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isRunning}
                                style={{
                                    opacity: isSubmitting || isRunning ? 0.5 : 1,
                                    cursor: isSubmitting || isRunning ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? <div className="loading-spinner"></div> : 'Submit'}
                            </button>
                            <button
                                className="show-demo-button"
                                onClick={handleShowDemo}
                                disabled={isRunning || isSubmitting}
                                style={{
                                    opacity: isRunning || isSubmitting ? 0.5 : 1,
                                    cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Demo
                            </button>

                            <button
                                className={`view-results-button ${hasSubmitted && responseReceived ? 'visible' : ''}`}
                                onClick={() => setShowResults(true)}
                            >
                                View Results
                            </button>
                        </div>
                    </div>
                    <div className="problem-right-lower">
                        <TestCases testCases={testCases} onSelect={handleTestCaseSelect}/>
                    </div>
                </div>
            </div>
            <button className="scroll-button" onClick={scrollToDiscussion}>
                Go to Comments
            </button>
            <br/>
            <ResultsModal
                show={showResults}
                results={results}
                onClose={handleCloseResults}
            />
            <div ref={discussionRef} className="discussion-section">
                <Comments problemId={problem.id}/>
            </div>
        </div>
    );
};

export default Problem;
