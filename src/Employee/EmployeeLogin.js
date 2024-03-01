import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../App';
import { useNavigate } from 'react-router-dom';

function EmployeeLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false); // Added state for form validity

  const validateForm = () => {
    if (email && password) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setErrorMsg('');
        setFormValid(true);
        return;
      }
    }
    // setErrorMsg('Please enter a valid email and password.');
    setFormValid(false);
  };

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const loggedInEmployeeId = user.uid; // Accessing the unique user ID

      console.log("Logged-in Employee ID:", loggedInEmployeeId);

      // Redirect to EmployeeTasks with the employee ID in the URL path
      navigate('/leads', { state: { loggedInEmployeeId } });
    } catch (error) {
      setErrorMsg('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className='row justify-content-center align-items-center vh-100'>
        <div className='col-md-3'></div>
        <div className='col-md-6'>
          <div className='card'>
          <div className="card-header text-center" style={{ backgroundColor: 'skyblue'  }}>
            <h2>Employee Login</h2>
          </div>
          <div className="card-body">
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateForm(); // Validate on change
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateForm(); // Validate on change
                }}
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!formValid || isSubmitting} // Use formValid for button disabled state
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

export default EmployeeLogin;
