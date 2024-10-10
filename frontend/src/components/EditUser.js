import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditUser.css'; // Import the updated CSS file

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

  if (loading) return <div className="user-edit-loading-message">Loading user information...</div>;
  if (error) return <div className="user-edit-error-message">{error}</div>;

  const availableCourses = courses.filter(
    (course) => !user.coursesTaught?.some((c) => c.courseCode === course.courseCode) &&
                !user.coursesEnrolled?.some((c) => c.courseCode === course.courseCode)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleUserManagement = () => {
    navigate('/userManagement');
  };

  return (
    <div className="user-edit-page-main">
      <div className='user-edit-page-header'>
        <header className="user-edit-page-header-body">
          <div className="user-edit-page-header-content">
            <h2>HMS</h2>
            <div className='user-edit-page-management-and-logout-buttons'>
              <button className="user-edit-page-user-management" onClick={handleUserManagement}>
                User Management
              </button>
            <button className="user-edit-page-logout-button" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>
      </div>
      <div className="user-edit-page">
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

        <button className="user-edit-page-save-changes-button" type="submit">Save Changes</button>
      </form>

      {user.user.role === 'lecturer' && (
        <div className="user-edit-course-section">
          <h2>Courses Taught</h2>
          <div>
            {user.coursesTaught.map((course) => (
              <li key={course._id} className="user-edit-course-item">
                {course.courseCode} - {course.courseName}
                <button
                  className="user-edit-delete-btn"
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
        <div className="user-edit-course-section">
          <h2>Courses Enrolled</h2>
          <div>
            {user.coursesEnrolled.map((course) => (
              <li key={course._id} className="user-edit-course-item">
                {course.courseCode} - {course.courseName}
                <button
                  className="user-edit-delete-btn"
                  onClick={() => handleCourseRemoving(course.courseCode)}
                >
                  Remove
                </button>
              </li>
            ))}
          </div>
        </div>
      )}

      <div className="user-edit-add-course-section">
        <h3>Add a New Course</h3>
        <select value={selectedCourse} onChange={handleCourseChange}>
          <option value="">Select a course</option>
          {availableCourses.map((course) => (
            <option key={course._id} value={course.courseCode}>
              {course.courseCode} - {course.courseName}
            </option>
          ))}
        </select>
        <button onClick={handleCourseAdding}>Add Course</button>
      </div>
      </div>
    </div>
  );
};

export default EditUser;
