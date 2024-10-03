import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css'; // Import the CSS file

const AdminPage = () => {
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Toggle the dropdown visibility
  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.classList.toggle('show');
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="admin-page">
      <h1>User Management</h1>

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
                <td>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(lecturer._id)}>⋮</button>
                    <div id={`dropdown-${lecturer._id}`} className="dropdown-content">
                      <button>Edit</button>
                      <button>Delete</button>
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
                <td>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(student._id)}>⋮</button>
                    <div id={`dropdown-${student._id}`} className="dropdown-content">
                      <button>Edit</button>
                      <button>Delete</button>
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
                <td>
                  <div className="dropdown">
                    <button className="dropbtn" onClick={() => toggleDropdown(admin._id)}>⋮</button>
                    <div id={`dropdown-${admin._id}`} className="dropdown-content">
                      <button>Edit</button>
                      <button>Delete</button>
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
