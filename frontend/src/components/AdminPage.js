import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AdminPage = () => {
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const decodeToken = async () => {
      try{
        const token = localStorage.getItem('token');
        if (!token)
          {
            window.location.href = '/403';
          }
        else{
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
        if (!(userRole === 'admin'))
        {
          window.location.href = '/403';
        }
        }
      }catch (err) {
        alert(err.message); // Display the error to the user
      }
    }

    decodeToken();
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const users = response.data;

        // Separate users by role and fetch role-specific information
        const lecturersData = [];
        const studentsData = [];
        const adminsData = [];

        // Loop through users and call appropriate role-specific routes
        await Promise.all(
          users.map(async (user) => {
            switch (user.role) {
              case 'lecturer':
                const lecturerResponse = await axios.get(`http://localhost:5000/api/user/lecturer/${user.username}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                lecturersData.push({ ...user, ...lecturerResponse.data });
                break;
              case 'student':
                const studentResponse = await axios.get(`http://localhost:5000/api/user/student/${user.username}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                studentsData.push({ ...user, ...studentResponse.data });
                break;
              case 'admin':
                adminsData.push(user); // Admins may not need extra information
                break;
              default:
                break;
            }
          })
        );

        setLecturers(lecturersData);
        setStudents(studentsData);
        setAdmins(adminsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Handle edit action
  const handleEdit = (username) => {
    navigate(`/update/${username}`);
  };

  // Handle delete action
  const handleDelete = async (username) => {
    const confirmed = window.confirm(`Are you sure you want to delete user: ${username}?`);
    if (!confirmed) return; // Exit if the user cancels
    // Logic for deleting the user
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/user/delete/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Optionally, refresh the user list after deletion
      setLecturers(lecturers.filter(lecturer => lecturer.username !== username));
      setStudents(students.filter(student => student.username !== username));
      setAdmins(admins.filter(admin => admin.username !== username));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Toggle the dropdown visibility
  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.classList.toggle('show');
  };

  if (loading) {
    return <div className='loading-users-div'>Loading users...</div>;
  }

  const handleAddUser = () => {
    navigate('/user/create');
  };

  return (
    <div className="admin-page">
      <div className='admin-page-header'>
        <header className="admin-page-header-body">
          <div className="admin-page-header-content">
            <h1>HMS</h1>
            <h1>User Management</h1>
            <div className='admin-page-add-user-and-logout-buttons'>
            <button className="admin-page-back-to-dashboard-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="admin-page-logout-button" onClick={handleAddUser}>Add User</button>
            <button className="admin-page-logout-button" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>
      </div>
      

      {/* Lecturer Section */}
      <section>
        <h2>Lecturers</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr key={lecturer._id}>
                <td>{lecturer.username}</td>
                <td>{lecturer.email}</td>
                <td>{lecturer.department}</td>
                <td className='admin-page-table-actions-button'>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(lecturer._id)}>⋮</button>
                    <div id={`dropdown-${lecturer._id}`} className="dropdown-content">
                    <button onClick={() => handleEdit(lecturer.username)}>Edit</button>
                    <button onClick={() => handleDelete(lecturer.username)}>Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Student Section */}
      <section>
        <h2>Students</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Enrollment Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>{student.enrollmentYear}</td>
                <td className='admin-page-table-actions-button'>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(student._id)}>⋮</button>
                    <div id={`dropdown-${student._id}`} className="dropdown-content">
                    <button onClick={() => handleEdit(student.username)}>Edit</button>
                    <button onClick={() => handleDelete(student.username)}>Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Admin Section */}
      <section>
        <h2>Admins</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td>{admin.username}</td>
                <td>{admin.email}</td>
                <td className='admin-page-table-actions-button'>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(admin._id)}>⋮</button>
                    <div id={`dropdown-${admin._id}`} className="dropdown-content">
                    <button onClick={() => handleDelete(admin.username)}>Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPage;
