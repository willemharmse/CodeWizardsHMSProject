import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AddUser.css'; // Ensure you create a separate CSS file for this page

const AddUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    role: '',
    department: '',
    coursesTaught: '',
    enrollmentYear: '',
    coursesEnrolled: ''
  });
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/course/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setUserData({ ...userData, role });
  };

  const handleCourseSelect = (e) => {
    setSelectedCourses([...selectedCourses, e.target.value]);
  };

  const handleUserCreation = async (e) => {
    e.preventDefault();
  
    const { username, password, email, role, department, enrollmentYear } = userData;
  
    // Prepare the body for the API request
    let requestBody = {
      username,
      password,
      email,
      role,
    };
  
    // Add additional fields based on the selected role
    if (role === 'lecturer') {
      requestBody = {
        ...requestBody,
        department
      };
    }
  
    if (role === 'student') {
      requestBody = {
        ...requestBody,
        enrollmentYear
      };
    }
  
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const response = await fetch('http://localhost:5000/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody), // Send the prepared request body
      });
  
      if (!response.ok) {
        throw new Error('User creation failed.');
      }
  
      console.log('User created successfully');
      // Handle success, e.g., redirect to another page or reset form
    } catch (err) {
      console.error(err.message);
      // Handle the error, display a message to the user if needed
    }
  };
  

  return (
    <div className="add-user-page-main">
      <h1>Add New User</h1>
      <form onSubmit={handleUserCreation}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Role:</label>
          <select name="role" value={userData.role} onChange={handleRoleChange}>
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="lecturer">Lecturer</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Show additional fields based on the role */}
        {userData.role === 'lecturer' && (
          <>
            <div>
              <label>Department:</label>
              <input
                type="text"
                name="department"
                value={userData.department}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Courses Taught:</label>
              <select onChange={handleCourseSelect}>
                <option value="">Select courses</option>
                {availableCourses.map((course) => (
                  <option key={course._id} value={course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {userData.role === 'student' && (
          <>
            <div>
              <label>Enrollment Year:</label>
              <input
                type="number"
                name="enrollmentYear"
                value={userData.enrollmentYear}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Courses Enrolled:</label>
              <select onChange={handleCourseSelect}>
                <option value="">Select courses</option>
                {availableCourses.map((course) => (
                  <option key={course._id} value={course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;
