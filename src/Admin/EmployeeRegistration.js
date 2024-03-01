import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth, db } from "../App";
import { useNavigate } from "react-router-dom";

function EmployeeRegistration() {
  const history = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [managerData, setManagerData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  // Additional state variables for new fields
  const [education, setEducation] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  // const [phoneNo, setPhoneNo] = useState("");
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [address, setAddress] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [branch, setBranch] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullName && email && password && mobile && selectedRole) {
      if (emailRegex.test(email)) {
        if (password.length >= 6) {
          setErrorMsg("");
          setPasswordError("");
          setFormValid(true);
          return;
        } else {
          setPasswordError("Minimum 6 characters required for the password.");
        }
      } else {
        setErrorMsg("Please enter a valid email address.");
      }
    } else {
      setErrorMsg("Please fill in all fields correctly.");
    }

    setFormValid(false);
  };

  useEffect(() => {
    validateForm();
    fetchEmployeeCount();
    if (selectedRole === 'Employee' && selectedDepartment) {
      fetchManagerNames(selectedDepartment);
    }
  }, [fullName, email, password, mobile, selectedRole, selectedDepartment]);


  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedManager(""); // Reset the selected manager when the role changes

    if (e.target.value === "Employee") {
      fetchManagerNames();
    }
  };

  const fetchManagerNames = async (department) => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'Manager'),
        where('department', '==', department) // Filter by department
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        fullName: doc.data().fullName,
      }));
      setManagerData(data);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };


  const fetchEmployeeCount = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const employeeCount = querySnapshot.docs.length;
      setEmployeeId(`EMPID${String(employeeCount + 1).padStart(3, "0")}`);
    } catch (error) {
      console.error("Error fetching employee count:", error);
    }
  };
  const handleFileUpload = async (file, folderName) => {
    if (!file) return "";

    const storage = getStorage();
    const fileRef = storageRef(storage, `${folderName}/${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with the full name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Get the selected manager's data
      const selectedManagerData = managerData.find(
        (manager) => manager.fullName === selectedManager
      );
      const assignedManagerUid = selectedManagerData
        ? selectedManagerData.uid
        : "";

      // Upload the photo and resume to Firebase Storage and get their download URLs
      const photoUrl = photo ? await handleFileUpload(photo, "photos") : "";
      const resumeUrl = resume ? await handleFileUpload(resume, "resumes") : "";

      // Store the new user's data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        password,
        mobile,
        department: selectedDepartment,
        role: selectedRole,
        assignedManager: selectedManager,
        assignedManagerUid,
        employeeId,
        timestamp: Timestamp.fromDate(new Date()),
        education,
        specialisation,
        resume: resumeUrl, // Store the resume URL
        fatherName,
        dob,
        gender,
        // phoneNo,
        photo: photoUrl, // Store the photo URL
        address,
        accountHolderName,
        accountNumber,
        bank,
        branch,
        aadhaarNumber,
        ifsc,
      });

      window.alert("Registered Successfully!!!");
    } catch (error) {
      console.error("Error during signup:", error);
      setErrorMsg("An error occurred during signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container ">
      <h2 className="text-center mb-4"> Registration</h2>
      <form onSubmit={handleSignup}>
        <div className="card mb-5">
          <div className="card-body">
            <h5 className="card-title">Personal Details</h5>

            {/* Name and Father's Name */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="fatherName" className="form-label">
                  Father's Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fatherName"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="dob" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  className="form-select"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone Number and Photo */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="mobile" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="photo" className="form-label">
                  Photo
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="photo"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
              </div>
            </div>

            {/* Address */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                {/* Input for Aadhaar Number */}
                <div className="mb-3">
                  <label htmlFor="aadhaarNumber" className="form-label">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="aadhaarNumber"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-5">
          <div className="card-body">
            <h5 className="card-title">Account and Role Details</h5>

            {/* Email and Password */}
            <div className="row">
              <div className="col-md-6">
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
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    required
                  />
                  {passwordError && (
                    <div className="text-danger">{passwordError}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
              <div className="mb-3">
  <label htmlFor="department" className="form-label">Department</label>
  <select
    className="form-select"
    id="department"
    name="department"
    value={selectedDepartment}
    onChange={(e) => {
      setSelectedDepartment(e.target.value);
      if (selectedRole === 'Employee') {
        fetchManagerNames(e.target.value); 
      }
    }}
    required
  >
    <option value="" disabled>Select Department</option>
    <option value="Development">Development</option>
    <option value="HR Team">HR Team</option>
    <option value="Testing">Testing</option>
    <option value="Training and Development">Training and Development</option> {/* New option added */}
  </select>
</div>

              </div>
            </div>

            {/* Role and Assigned Manager */}
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    required
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              {selectedRole === "Employee" && (
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="manager" className="form-label">
                      Assigned To Manager
                    </label>
                    <select
                      className="form-select"
                      id="assignedmanager"
                      name="assignedmanager"
                      value={selectedManager}
                      onChange={(e) => setSelectedManager(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Manager
                      </option>
                      {managerData.map((manager) => (
                        <option key={manager.uid} value={manager.fullName}>
                          {manager.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
           
          </div>
        </div>

        <div className="card mb-5">
          <div className="card-body">
            <h5 className="card-title">Education Details</h5>

            {/* Input for Department */}
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="education" className="form-label">
                    High Education
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input for Designation */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="specialisation" className="form-label">
                    Specialisation
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="specialisation"
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Input for Resume (File Upload) */}
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="resume" className="form-label">
                    Resume
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="resume"
                    onChange={(e) => setResume(e.target.files[0])} // Assuming file upload handling
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Bank Details</h5>

                {/* Account Number Input */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="accountNumber" className="form-label">
                        Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Bank Name Input */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="bank" className="form-label">
                        Bank
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="bank"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Branch Input */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="branch" className="form-label">
                        Branch
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="ifsc" className="form-label">
                        IFSC Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ifsc"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formValid || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeRegistration;
