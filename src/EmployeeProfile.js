import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  doc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth, db } from "./App";
import { useNavigate } from "react-router-dom";

function EmployeeRegistration() {
  const history = useNavigate();

  const [showPhotoInput, setShowPhotoInput] = useState(false);

  const handleShowPhotoInput = () => {
    if (isEditMode) {
      setShowPhotoInput(true);
    }
  };

  const [isEditMode, setIsEditMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [managerData, setManagerData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  const [education, setEducation] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [address, setAddress] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [branch, setBranch] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [photoUrl, setPhotoUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const handleFileUpload = async (file, folderName) => {
    if (!file) return "";

    const storage = getStorage();
    const fileRef = storageRef(storage, `${folderName}/${file.name}`);
    await uploadBytes(fileRef, file);

    const url = await getDownloadURL(fileRef);
    if (folderName === "photos") {
      setPhotoUrl(url); // Set the photo URL
    } else if (folderName === "resumes") {
      setResumeUrl(url); // Set the resume URL
    }

    return url;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    setResume(file);
  };

  useEffect(() => {
    if (loggedInEmployeeId) {
      fetchEmployeeData(loggedInEmployeeId);
    }
    validateForm();
    fetchEmployeeCount();
  }, [loggedInEmployeeId]);

  const fetchEmployeeData = async (loggedInEmployeeId) => {
    try {
      const employeeDocRef = doc(db, "users", loggedInEmployeeId);
      const employeeDocSnap = await getDoc(employeeDocRef);

      if (employeeDocSnap.exists()) {
        const employeeData = employeeDocSnap.data();
        console.log("Fetched Employee Data:", employeeData); // Log the data to the console

        // Set state variables with fetched data
        setFullName(employeeData.fullName || "");
        setEmail(employeeData.email || "");
        setPassword(employeeData.password || ""); // Assuming there's a password field
        setMobile(employeeData.mobile || "");
        setRole(employeeData.role || "");

        setEducation(employeeData.education || "");
        setSpecialisation(employeeData.specialisation || "");
        setFatherName(employeeData.fatherName || "");
        setDob(employeeData.dob || "");
        setGender(employeeData.gender || "");
        setPhotoUrl(employeeData.photo || "");
        setResumeUrl(employeeData.resume || "");
        setAddress(employeeData.address || "");
        setAccountHolderName(employeeData.accountHolderName || "");
        setAccountNumber(employeeData.accountNumber || "");
        setBank(employeeData.bank || "");
        setBranch(employeeData.branch || "");
        setAadhaarNumber(employeeData.aadhaarNumber || "");
        setIfsc(employeeData.ifsc || "");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

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
  }, [fullName, email, password, mobile, selectedRole]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedManager("");

    if (e.target.value === "Employee") {
      fetchManagerNames();
    }
  };

  const fetchManagerNames = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "Manager"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        fullName: doc.data().fullName,
      }));
      setManagerData(data);
    } catch (error) {
      console.error("Error fetching manager data:", error);
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
  const handleSave = async () => {
    try {
      // Check if a new photo is uploaded
      let newPhotoUrl = photoUrl; // Use the existing photo URL as a fallback
      if (photo) {
        newPhotoUrl = await handleFileUpload(photo, "photos");
      }

      // Check if a new resume is uploaded
      let newResumeUrl = resumeUrl; // Use the existing resume URL as a fallback
      if (resume) {
        newResumeUrl = await handleFileUpload(resume, "resumes");
      }

      // Construct the updated employee data object
      const updatedEmployeeData = {
        fullName,
        email,
        password, // Consider security implications of storing passwords
        mobile,
        role,
        education,
        specialisation,
        fatherName,
        dob,
        gender,
        photoUrl: newPhotoUrl, // Use the new photo URL
        resumeUrl: newResumeUrl, // Use the new resume URL
        address,
        accountHolderName,
        accountNumber,
        bank,
        branch,
        aadhaarNumber,
        ifsc,
      };

      // Update the data in Firestore
      const employeeDocRef = doc(db, "users", loggedInEmployeeId);
      await setDoc(employeeDocRef, updatedEmployeeData, { merge: true });

      // Turn off edit mode
      setIsEditMode(false);

      // Optionally, show a success message or handle UI changes
    } catch (error) {
      console.error("Error updating employee data:", error);
      // Optionally, handle the error in UI (e.g., show an error message)
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4"> My Profile</h2>
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
                readOnly={!isEditMode}
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
                readOnly={!isEditMode}
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
                readOnly={!isEditMode}
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
                readOnly={!isEditMode}
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
                readOnly={!isEditMode}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              {photoUrl && (
                <div className="row">
                  {/* Existing photo display and upload trigger */}
                  <div className="col-md-6 mb-3">
                    <label>Photo:</label>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {photoUrl && (
                        <img
                          src={photoUrl}
                          alt="Uploaded Photo"
                          style={{
                            width: "100px",
                            height: "100px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            document.getElementById("photoInput").click()
                          }
                        />
                      )}
                      <input
                        type="file"
                        id="photoInput"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={!isEditMode}
                      />
                      {!photoUrl && isEditMode && (
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("photoInput").click()
                          }
                        >
                          Upload Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      
          {/* <h5 className="card-title">Account and Role Details</h5>
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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
                  required
                />
                {passwordError && (
                  <div className="text-danger">{passwordError}</div>
                )}
              </div>
            </div>
          </div> */}

          {/* Role and Assigned Manager */}
          
            {/* <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <input
                  type="role"
                  className="form-control"
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  readOnly={!isEditMode}
                  required
                />
              </div>
            </div> */}
            {/* <div className="card mb-5">
        <div className="card-body">
            <div className="row">
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
                    readOnly={!isEditMode}
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
      </div> */}

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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
                  required
                />
              </div>
            </div>
          </div>

          {/* Input for Resume (File Upload) */}
          <div className="row">
            {/* Existing resume display and upload trigger */}
            <div className="col-md-6 mb-3">
              <label>Resume:</label>
              {resumeUrl && (
                <div>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("resumeInput").click()
                      }
                    >
                      Change Resume
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                id="resumeInput"
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={!isEditMode}
              />
              {!resumeUrl && isEditMode && (
                <button
                  type="button"
                  onClick={() => document.getElementById("resumeInput").click()}
                >
                  Upload Resume
                </button>
              )}
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
                      readOnly={!isEditMode}
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
                      readOnly={!isEditMode}
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
                      readOnly={!isEditMode}
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
                      readOnly={!isEditMode}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          {isEditMode ? (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
            >
              Save
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditMode(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeRegistration;
