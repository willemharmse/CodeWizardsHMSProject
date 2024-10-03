import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]); // Store courses
  const [assignments, setAssignments] = useState([]); // Store assignments
  const [submissions, setSubmissions] = useState([]); // Store submissions
  const [selectedCourse, setSelectedCourse] = useState(null); // Track selected course
  const [selectedAssignment, setSelectedAssignment] = useState(null); // Track selected assignment
  const [token, setToken] = useState(''); // Store the token
  const [role, setRole] = useState(''); // Store user role (admin/lecturer)
  const navigate = useNavigate(); // Use navigate for routing

  // Decode the token and get the role
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode(storedToken); // Decode the token
      setRole(decodedToken.role); // Extract role from the token
    }
  }, []);

  // Fetch courses based on the user's role
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token || !role) return;

      try {
        let response;
        if (role === 'admin') {
          // Admin: Fetch all courses
          response = await axios.get('http://localhost:5000/api/course/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else if (role === 'lecturer') {
          // Lecturer: Fetch their own courses
          response = await axios.get('http://localhost:5000/api/course/courses/lecturer', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        setCourses(response.data); // Assuming response.data contains an array of courses
      } catch (error) {
        console.error('Error fetching courses', error);
      }
    };

    fetchCourses();
  }, [token, role]);

  // Fetch assignments for the selected course
  const handleCourseClick = async (courseCode) => {
    setSelectedCourse(courseCode); // Set selected course
    setAssignments([]); // Clear previous assignments
    setSubmissions([]); // Clear previous submissions

    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/course/${courseCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssignments(response.data); // Assuming response.data contains an array of assignments
    } catch (error) {
      console.error('Error fetching assignments', error);
    }
  };

  // Fetch submissions for the selected assignment
  const handleAssignmentClick = async (assignCode) => {
    setSelectedAssignment(assignCode); // Set selected assignment
    setSubmissions([]); // Clear previous submissions

    try {
      const response = await axios.get(`http://localhost:5000/api/submission/assignment/${assignCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubmissions(response.data); // Assuming response.data contains an array of submissions
    } catch (error) {
      console.error('Error fetching submissions', error);
    }
  };

  const handleSubmissionClick = (submissionId) => {
    navigate(`/submission/${submissionId}`);
  };

  return (
    <div className="dashboard">
      <h1>{role === 'admin' ? 'Admin Dashboard' : 'Lecturer Dashboard'}</h1>

      {/* Courses Row */}
      <div className="courses-row">
        {courses.map((course) => (
          <div
            key={course._id}
            className={`course-button ${selectedCourse === course.courseCode ? 'selected' : ''}`}
            onClick={() => handleCourseClick(course.courseCode)} // Load assignments when a course is clicked
          >
            {course.courseCode} {/* Display course name */}
          </div>
        ))}
      </div>

      {/* Assignments Row */}
      {selectedCourse && assignments.length > 0 && (
        <div className="assignment-list">
          <h2>Assignments for Course: {selectedCourse}</h2>
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className={`assignment-button ${selectedAssignment === assignment.assignCode ? 'selected' : ''}`}
              onClick={() => handleAssignmentClick(assignment.assignCode)} // Load submissions when an assignment is clicked
            >
              {assignment.title} {/* Display assignment title */}
            </div>
          ))}
        </div>
      )}

      {/* Submissions Row */}
      {selectedAssignment && submissions.length > 0 && (
        <div className="submissions-list">
          <h2>Submissions for Assignment: {selectedAssignment}</h2>
          {submissions.map((submission) => (
              <div
                key={submission._id}
                className="submission-item"
                onClick={() => handleSubmissionClick(submission._id)} // Redirect to submission page
              >
                <p>Submission by: {submission.user.username}</p>
                <p>Grade: {submission.grade || 'Not graded'}</p>
                <p>Feedback: {submission.feedback || 'No Feedback'}</p>
                </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
