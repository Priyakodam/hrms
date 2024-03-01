import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if the entered credentials match the predefined admin credentials
    if (username === 'Admin' && password === 'Admin@123') {
      // Redirect to AdminDashboard
      navigate('/metrics');
    } else {
      // Show error message for invalid credentials
      setErrorMsg('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className='row justify-content-center align-items-center vh-100'>
        <div className='col-md-3'></div>
        <div className='col-md-6'>
          <div className='card'>
            <div className="card-header text-center" style={{ backgroundColor: 'skyblue' }}>
              <h2>Admin Login</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className={`btn btn-primary ${isSubmitting ? 'disabled' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
            {errorMsg && <p className="text-danger mt-3">{errorMsg}</p>}
          </div>
        </div>
        <div className='col-md-3'></div>
      </div>
    </div>
  );
}

export default AdminLogin;
