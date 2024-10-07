import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom'; // To get user ID from URL and navigate back after editing

const EditUser = () => {
  const { username } = useParams(); // Get user ID from the URL
  const navigate = useNavigate(); // Navigate after editing
  const [user, setUser] = useState(null); // State for storing user information
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]); // State for available courses
  const [selectedCourse, setSelectedCourse] = useState(''); // State for the selected course

  // Fetch the user information based on the username
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data); // Set user data
        setLoading(false); // Turn off loading state
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
        setCourses(response.data); // Set available courses
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      }
    };

    fetchUser();
    fetchCourses();
  }, [username]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Handle course addition/removal
  const handleCourseAdding = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(`http://localhost:5000/api/course/student/${username}/${selectedCourse}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSelectedCourse(''); // Clear the selection
    } catch (err) {
      console.error('Error updating courses:', err);
      setError('Failed to update courses');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/update/${username}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Redirect back to admin page or show success message
      navigate('/userManagement');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  if (loading) return <div>Loading user information...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edit-user-page">
      <h1>Edit User: {user.user.username}</h1>
      <form onSubmit={handleSubmit}>
        {/* Role-specific fields */}
        {user.user.role === 'lecturer' && (
          <>
            <div>
              <label>Department:</label>
              <input
                type="text"
                name="department"
                value={user.department || ''}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {user.user.role === 'student' && (
        <>
            <div>
            <label>Enrollment Year:</label>
            <input
                type="number"
                name="enrollmentYear"
                value={user.enrollmentYear || ''}
                onChange={handleChange}
            />
            </div>

            <div>
            <label>Enrolled Courses:</label>
            <ul>
                {user.coursesEnrolled.map((course) => (
                <li key={course._id}>{course.courseCode}</li>
                ))}
            </ul>
            </div>

            <div>
            <label>Select Course:</label>
            <select value={selectedCourse} onChange={handleCourseChange}>
                <option value="">Select a course</option>
                {courses.map((course) => (
                <option key={course._id} value={course.courseCode}>  {/* Changed to courseCode */}
                    {course.courseCode}  {/* Displaying courseName */}
                </option>
                ))}
            </select>
            <button type="button" onClick={() => handleCourseAdding()}>Add Course</button>
            <button type="button" onClick={() => handleCourseAdding('remove')}>Remove Course</button>
            </div>
        </>
        )}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUser;
