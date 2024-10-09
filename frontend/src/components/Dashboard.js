import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [title, setAssignmentTitle] = useState('');
  const [dueDate, setAssignmentDueDate] = useState('');
  const [mark, setAssignmentMark] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseTitle] = useState('');
  const [description, setCourseDescription] = useState('');//course description
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false); // New state for adding courses
  const [isAddingAssignment, setIsAddingAssignment] = useState(false); // New state for adding assignments
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = jwtDecode(storedToken);
      setRole(decodedToken.role);

      if (decodedToken.role === 'student') {
        navigate('/403');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!token || !role) return;

      try {
        let response;
        if (role === 'admin') {
          response = await axios.get('http://localhost:5000/api/course/', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (role === 'lecturer') {
          response = await axios.get('http://localhost:5000/api/course/courses/lecturer', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses', error);
      }
    };

    fetchCourses();
  }, [token, role]);

  const handleCourseClick = async (courseCode) => {
    setSelectedCourse(courseCode);
    setSelectedAssignment(null);
    setAssignments([]);
    setSubmissions([]);
    setIsAddingCourse(false); // Reset any "add" mode when navigating
    setIsAddingAssignment(false);

    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/course/${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments', error);
    }
  };

  const handleDownloadResource = async (assignCode) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/grades/${assignCode}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob', // Set responseType to blob for binary data
      });

      // Create a URL for the blob response
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element and set the URL to it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'grades.xlsx'); // Set the file name

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Free up memory
  } catch (error) {
      console.error('Error downloading resource:', error);
  }
  };

  const handleAssignmentClick = async (assignCode) => {
    setSelectedAssignment(assignCode);
    setSubmissions([]);
    setIsAddingAssignment(false); // Reset "add assignment" mode

    try {
      const response = await axios.get(`http://localhost:5000/api/submission/assignment/${assignCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions', error);
    }
  };

  const handleSubmissionClick = (submissionId) => {
    navigate(`/submission/${submissionId}`);
  };

  const handleAddCourse = () => {
    setIsAddingCourse(true);
    setIsAddingAssignment(false);
  };

  const handleAddAssignment = () => {
    setIsAddingAssignment(true);
    setIsAddingCourse(false);
  };

  const handleBackToView = () => {
    setIsAddingCourse(false);
    setIsAddingAssignment(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleUserManagement = () => {
    navigate('/userManagement');
  };

  const handleCourseCreation = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/course/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseCode,
          courseName,
          description
        }),
      });

      if (!response.ok) {
        throw new Error('Course creation failed.');
      }
    } catch (err) {
      console.log(err.message); // Display the error to the user
    }
  };

  const handleAssignmentCreation = (courseCode) => async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/assignment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          courseCode,
          mark
        }),
      });

      if (!response.ok) {
        throw new Error('Assignment creation failed.');
      }
    } catch (err) {
      console.log(err.message); // Display the error to the user
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(assignmentSearch.toLowerCase())
  );

  const filteredSubmissions = submissions.filter((submission) =>
    submission.user.username.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className='dashboard-header'>
        <header className="dashboard-header-body">
          <div className="dashboard-header-content">
            <h2>HMS</h2>
            {role === 'admin' && (
              <button className="dashboard-logout-button" onClick={handleUserManagement}>
                User Management
              </button>
            )}
            <button className="dashboard-logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>
      </div>

      <div className='dashboard-body'>
        {/* Sidebar */}
        <div className="sidebar">
        <div className="sidebar-header">
        <h2>{isAddingCourse ? 'Add Course' : 'Courses'}</h2>
          {isAddingCourse ? (
            <FontAwesomeIcon className="logo-link" icon={faArrowLeft} onClick={handleBackToView} />
          ) : (
            // Only show the plus icon if the user is an admin
            role === 'admin' && <FontAwesomeIcon className="logo-link" icon={faPlus} onClick={handleAddCourse} />
          )}
        </div>

          
          {isAddingCourse ? (
            <form className="add-course-form" onSubmit={handleCourseCreation}>
              <input 
                className="add-course-form-code" 
                type="text" 
                placeholder="Course Code" 
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required/>
              <input 
                className="add-course-form-title" 
                type="text" 
                placeholder="Course Title" 
                value={courseName}
                onChange={(e) => setCourseTitle(e.target.value)}
                required/>
              <input 
                className="add-course-form-description" 
                type="text" 
                placeholder="Course Description" 
                value={description}
                onChange={(e) => setCourseDescription(e.target.value)}
                required/>
              <button type='submit' className="add-course-form-add-button" >Add Course</button>
            </form>
          ) : (
            <>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
              </div>
              <div className="course-list">
                {filteredCourses.map((course) => (
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
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {isAddingAssignment ? (
            <div>
              <div className="assignment-header">
                <h2>Add Assignment for {selectedCourse}</h2>
                <FontAwesomeIcon className="logo-link" icon={faArrowLeft} onClick={handleBackToView} />
              </div>
              <form onSubmit={handleAssignmentCreation(selectedCourse)} className="add-assignment-form">
                <input type="text" placeholder="Assignment Title"
                value={title}
                onChange={(e) => setAssignmentTitle(e.target.value)} 
                required
                />
                <input type="text" placeholder="Assignment Description"
                value={description}
                onChange={(e) => setCourseDescription(e.target.value)} 
                required
                />
                <input type="date" placeholder="Assignment Due Date" 
                value={dueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
                required
                />
                <input type="text" placeholder="Assignment Max Mark" 
                value={mark}
                onChange={(e) => setAssignmentMark(e.target.value)}
                required
                />
                <button type='submit' className="add-assignment-form-add-button">Add Assignment</button>
              </form>
            </div>
          ) : (
            selectedAssignment ? (
              <div className="submission-section">
                <h2>Submissions for {selectedAssignment}</h2>
                <button className="download-button" onClick={() => handleDownloadResource(selectedAssignment)}>
                <FontAwesomeIcon className="logo-link" icon={faDownload}/>
                </button>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                  />
                </div>
                <div className="submission-list">
                  {filteredSubmissions.map((submission) => (
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
                <div className="assignment-header">
                  <h2>Assignments for {selectedCourse}</h2>
                  <FontAwesomeIcon className="logo-link" icon={faPlus} onClick={handleAddAssignment} />
                </div>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
                <div className="assignment-list">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className={`assignment-item ${selectedAssignment === assignment.assignCode ? 'selected' : ''}`}
                      onClick={() => handleAssignmentClick(assignment.assignCode)}
                    >
                      <div className="assignment-icon"></div>
                      <div className="assignment-details">
                        <h3>{assignment.title}</h3>
                        <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
