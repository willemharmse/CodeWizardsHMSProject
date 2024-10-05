import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import './SubmissionDetail.css'; // Importing the CSS file if you choose to separate it

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate(); // Initialize navigate
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [videoSrc, setVideoSrc] = useState(null);
  const [gradeWarning, setGradeWarning] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/submission/${submissionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmission(response.data);
        fetchVideoStream(response.data.file);
      } catch (error) {
        console.error('Error fetching submission details:', error);
      }
    };

    const fetchVideoStream = async (fileId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/file/stream/${fileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Range: 'bytes=0-',
          },
          responseType: 'blob',
        });

        const videoUrl = URL.createObjectURL(response.data);
        setVideoSrc(videoUrl);
      } catch (error) {
        console.error('Error fetching video stream:', error);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const handleGradeChange = (e) => {
    const enteredGrade = e.target.value;
    setGrade(enteredGrade);

    // Check if grade is within bounds based on the assignment mark
    const maxGrade = submission?.assignment?.mark || 100; // Default to 100 if max mark is not defined
    if (enteredGrade < 0 || enteredGrade > maxGrade) {
      setGradeWarning(`Grade must be between 0 and ${maxGrade}.`);
    } else {
      setGradeWarning(''); // Clear the warning if grade is valid
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the JWT from localStorage
    navigate('/'); // Redirect to login page or home page after logging out
  };

  const handleGradeSubmit = async () => {
    if (gradeWarning) {
      alert('Please correct the grade before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/submission/grade/${submissionId}`,
        { grade, feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Grade and feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting grade and feedback:', error);
    }
  };

  if (!submission) {
    return <div className="loading">Loading submission...</div>;
  }

  return (
    <div className='submission-page'>
      <div className='submission-page-header'>
        <header className="submission-header-body">
          <div className="submission-header-content">
            <h2>HMS</h2>
            <button className="submission-logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>
      </div>
    <div className="submission-detail">
      <h1 className="submission-title">Submission Grading</h1>
      <h2 className="submission-user">User: {submission.user.username}</h2>
      <h2 className="submission-user">Video file submitted:</h2>
      {/* Video player */}
      {videoSrc ? (
        <video controls width="600" className="video-player">
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading video...</p>
      )}

      {/* Grade and Feedback form */}
      <div className="grading-form">
        <label htmlFor="grade">Grade:</label>
        <input
          id="grade"
          className="input-field"
          type="number"
          value={grade}
          onChange={handleGradeChange} // Validate grade on change
          placeholder="Enter grade"
        />
        {/* Display warning if grade is out of bounds */}
        {gradeWarning && <p className="warning">{gradeWarning}</p>}
        
        <label htmlFor="feedback">Feedback:</label>
        <input
          id="feedback"
          className="input-field"
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter feedback"
        />
        <button
          onClick={handleGradeSubmit}
          className="submit-button"
          disabled={!!gradeWarning || grade === ''} // Disable if gradeWarning or empty grade
        >
          Grade Submission
        </button>
      </div>
    </div>
    </div>
  );
};

export default SubmissionDetail;
