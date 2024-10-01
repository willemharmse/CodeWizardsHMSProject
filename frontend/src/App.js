import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://your-backend-url/api/login', {
                username,
                password
            });

            if (response.data.token) {
                // Save the token to localStorage or cookies
                localStorage.setItem('token', response.data.token);
                
                // Redirect or update UI after successful login
                window.location.href = '/dashboard'; // Example redirection
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
