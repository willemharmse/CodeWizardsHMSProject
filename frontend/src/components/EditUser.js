import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditUser.css'; // Import the CSS file

const EditUser = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/course/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      }
    };

    fetchUser();
    fetchCourses();
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleCourseAdding = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.user.role === 'student'
        ? `http://localhost:5000/api/course/student/${username}/${selectedCourse}`
        : `http://localhost:5000/api/course/lecturer/${username}/${selectedCourse}`;
      await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Refresh user data after adding course
      const updatedUser = await axios.get(`http://localhost:5000/api/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(updatedUser.data);
      setSelectedCourse('');
    } catch (err) {
      console.error('Error updating courses:', err);
      setError('Failed to update courses');
    }
  };

  const handleCourseRemoving = async (courseCode) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/course/remove/${username}/${courseCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Refresh the user's data after removing the course
      const updatedUser = await axios.get(`http://localhost:5000/api/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(updatedUser.data);
    } catch (err) {
      console.error('Error removing course:', err);
      setError(`Failed to remove course: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/update/${username}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/userManagement');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  if (loading) return <div className="edit-user-loading-message">Loading user information...</div>;
  if (error) return <div className="edit-user-error-message">{error}</div>;

  // Filter courses to exclude already enrolled or taught courses
  const availableCourses = courses.filter(
    (course) => !user.coursesTaught?.some((c) => c.courseCode === course.courseCode) &&
                !user.coursesEnrolled?.some((c) => c.courseCode === course.courseCode)
  );

  return (
    <div className="edit-user-page">
      <h1>Edit User: {user.user.username}</h1>
      <form onSubmit={handleSubmit}>
        {user.user.role === 'lecturer' && (
          <div>
            <label>Department:</label>
            <input
              type="text"
              name="department"
              value={user.department || ''}
              onChange={handleChange}
            />
          </div>
        )}

        {user.user.role === 'student' && (
          <div>
            <label>Enrollment Year:</label>
            <input
              type="number"
              name="enrollmentYear"
              value={user.enrollmentYear || ''}
              onChange={handleChange}
            />
          </div>
        )}

        <button className='edit-user-page-save-changes-button' type="submit">Save Changes</button>
      </form>

      {/* Courses section */}
      {user.user.role === 'lecturer' && (
        <div className="edit-user-course-section">
          <h2>Courses Taught</h2>
          <div>
            {user.coursesTaught.map((course) => (
              <li key={course._id} className="edit-user-course-item">
                {course.courseCode}
                <button
                  className="edit-user-delete-btn"
                  onClick={() => handleCourseRemoving(course.courseCode)}
                >
                  Remove
                </button>
              </li>
            ))}
          </div>
        </div>
      )}

      {user.user.role === 'student' && (
        <div className="edit-user-course-section">
          <h2>Enrolled Courses</h2>
          <ul>
            {user.coursesEnrolled.map((course) => (
              <li key={course._id} className="edit-user-course-item">
                {course.courseCode}
                <button
                  className="edit-user-delete-btn"
                  onClick={() => handleCourseRemoving(course.courseCode)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Course Section */}
      <div className="edit-user-add-course-section">
        <h3>Add Course</h3>
        <select value={selectedCourse} onChange={handleCourseChange}>
          <option value="">Select a course</option>
          {availableCourses.map((course) => (
            <option key={course._id} value={course.courseCode}>
              {course.courseCode} - {course.courseName}
            </option>
          ))}
        </select>
        <button className='edit-user-page-add-course-btn' onClick={handleCourseAdding} disabled={!selectedCourse}>
          Add Course
        </button>
      </div>
    </div>
  );
};

export default EditUser;
