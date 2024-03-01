import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from './App';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const history = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged-in user:', user); // Log the user object
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      console.log('User data:', userData); // Log the userData object
  
      // Check for admin and manager credentials
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        history('/AdminDashboard');
        return;
      } else if (email === 'manager@gmail.com' && password === 'manager@123') {
        history('/Dashboard');
        return;
      }
  
      // Check if userData is defined before accessing its properties
      if (userData) {
        console.log('User role:', userData.role, 'Department:', userData.department); // Log the role and department
  
        if (userData.role === 'Employee' && userData.department === 'HR Team') {
          history('/HRDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager' && userData.department === 'HR Team') {
          history('/HRManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Employee' && userData.department === 'Training and Development') {
          history('/T&DDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager' && userData.department === 'Training and Development') {
          history('/TDManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Employee') {
          history('/EmployeeDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager') {
          history('/ManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else {
          setErrorMsg('Invalid email or password. Please try again.');
        }
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Firebase login error:', error.code, error.message);
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                required
              />
            </div>
            <div className="mb-3" style={{ position: 'relative' }}>
        <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: '5px' }}>
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
        <i
          onClick={togglePasswordVisibility}
          style={{ position: 'absolute', right: '10px', top: '40px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </i>
      </div>
            {errorMsg && <div className="text-danger">{errorMsg}</div>}
            <div className="text-center">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-3"></div>
      </div>
    </div>
  );
}

export default Login;
