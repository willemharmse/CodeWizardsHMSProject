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
      
      if (decodedToken.role === 'student') {
        navigate('/403'); // Redirect to your 403 page
      }    
    }
  }, [navigate]);

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
    setSelectedAssignment(null); // Reset the selected assignment to show assignments instead of submissions
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
      <div className='dashboard-header'>
      <header className="landing-header">
        <div className="header-content">
          <h2>HMS</h2>
        </div>
      </header>
      </div>
      
      <div className='dashboard-body'>
      <div className="sidebar">
        <h2>Courses</h2>
        <div className="search-bar">
          <input type="text" placeholder="Search courses..." />
        </div>
        <div className="course-list">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`course-item ${selectedCourse === course.courseCode ? 'selected' : ''}`}
              onClick={() => handleCourseClick(course.courseCode)}
            >
              <div className="course-icon"></div>
              <div className="course-details">
                <h3>{course.courseCode}</h3>
                <p>{course.courseName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="main-content">
        {selectedAssignment ? (
          <div className="submission-section">
            <h2>Submissions for {selectedAssignment}</h2>
            <div className="submission-list">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="submission-item"
                  onClick={() => handleSubmissionClick(submission._id)}
                >
                  <div className="submission-icon"></div>
                  <div className="submission-details">
                    <h3>{submission.user.username}</h3>
                    <p>Grade: {submission.grade || 'Not graded'}</p>
                    <p>Feedback: {submission.feedback || 'No feedback'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="assignment-section">
            <h2>Assignments for {selectedCourse}</h2>
            <div className="assignment-list">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="assignment-item"
                  onClick={() => handleAssignmentClick(assignment.assignCode)}
                >
                  <div className="assignment-icon"></div>
                  <div className="assignment-details">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.courseName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
