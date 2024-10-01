import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [assignments, setAssignments] = useState([]); // Store assignments
  const [submissions, setSubmissions] = useState([]); // Store submissions for the selected assignment
  const [selectedAssignment, setSelectedAssignment] = useState(null); // Track the currently selected assignment
  const [token, setToken] = useState(''); // State to store the token

  useEffect(() => {
    // Retrieve the token when the component mounts
    const storedToken = localStorage.getItem('token'); // Adjust this to your token retrieval logic
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // Run only once when the component mounts

  // Fetch assignments from backend
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!token) return; // Don't fetch if token is not available

      try {
        const response = await axios.get('http://localhost:5000/api/assignment/course/CS201', {
          headers: {
            Authorization: `Bearer ${token}` // Include the bearer token in the header
          }
        });
        setAssignments(response.data); // Assuming response.data is an array of assignments
      } catch (error) {
        console.error('Error fetching assignments', error);
      }
    };

    fetchAssignments();
  }, [token]); // Fetch assignments whenever the token changes

  // Function to handle click on each assignment
// Function to handle click on each assignment
const handleClick = async (assignCode) => {
    setSelectedAssignment(assignCode); // Set the currently selected assignment
    setSubmissions([]); // Clear previous submissions
    console.log(`Clicked assignment with AssignCode: ${assignCode}`);
  
    try {
      // Fetch submissions for this assignment using assignCode
      const response = await axios.get(`http://localhost:5000/api/submission/assignment/${assignCode}`, {
        headers: {
          Authorization: `Bearer ${token}` // Include the bearer token in the header
        }
      });
  
      const submissionsData = response.data; // Assuming the response contains submission data
      console.log('Submissions for this assignment:', submissionsData);
      setSubmissions(submissionsData); // Update submissions state
    } catch (error) {
      console.error('Error fetching submissions', error);
    }
  };
  

  return (
    <div className="dashboard">
      <h1>Assignments</h1>
      <div className="assignment-list">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="assignment-button"
            onClick={() => handleClick(assignment.assignCode)} // Pass assignCode
          >
            {assignment.title} {/* Display assignment title */}
          </div>
        ))}
      </div>
      {selectedAssignment && submissions.length > 0 && ( // Check if an assignment is selected and submissions exist
        <div className="submissions-list">
          <h2>Submissions for Assignment: {selectedAssignment}</h2>
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-item">
              {/* Display submission data; customize as needed */}
              <p>Submission ID: {submission._id}</p>
              <p>Grade: {submission.grade}</p>
              <p>Feedback: {submission.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
