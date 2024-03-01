import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeReport from "./EmployeeReport";
import VacantPositions from "./VacantPositions";
import SelfReview from './SelfReview' ;
import Dashboard from "./Dashboard";


function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  console.log("loggedInEmployeeId=", loggedInEmployeeId);

  const [showAddLeads, setShowAddLeads] = useState(false);
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [showVacantPositions, setShowVacantPositions] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHeading, setShowHeading] = useState(true);


  const handlePerformanceReportClick = () => {
    setShowPerformanceReport(true);
    setShowVacantPositions(false);
    setShowReview(false);
    setShowDashboard(false);
  };

  const handleVacantPositionsClick = () => {
    setShowPerformanceReport(false);
    setShowVacantPositions(true);
    setShowReview(false);
    setShowDashboard(false);
  };

  const handleReviewClick = () => {
    setShowPerformanceReport(false);
    setShowVacantPositions(false);
    setShowReview(true);
    setShowDashboard(false);

  };

  const handleDashboardClick = () => {
    setShowPerformanceReport(false);
    setShowVacantPositions(false);
    setShowReview(false);
    setShowDashboard(true);

  };

  const handleLogout = () => {
    navigate("/");
  };

  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, "users");
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
          }
        });
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: "10px 20px",
        }}
      >
        <h3>{loggedInEmployeeName}</h3>
        <button
          onClick={handleLogout}
          style={{
            textDecoration: "none",
            color: "#333",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            border: "none",
            background: "#f0f0f0",
            marginLeft: "20px",
            transition: "background-color 0.3s ease",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "200px",
            backgroundColor: "#f0f0f0",
            padding: "20px",
            height: "calc(100vh - 40px)",
          }}
        >
          {/* <h3 className='text-center'>{loggedInEmployeeName}</h3> */}
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {/* <li style={{ marginBottom: '10px' }}>
            <button onClick={handleDashboardClick} 
             style={{
              textDecoration: 'none',
              color: '#333',
              padding: '8px 16px',
              borderRadius: '4px',
              display: 'block',
              transition: 'background-color 0.3s ease',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
            }}>
              Dashboard
            </button>
          </li> */}

<li style={{ marginBottom: "10px" }}>
              <button
                onClick={handleDashboardClick}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  display: "block",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
              >
                Dashboard
              </button>
            </li>

            <li style={{ marginBottom: "10px" }}>
              <button
                onClick={handleReviewClick}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  display: "block",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
              >
                Review
              </button>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <button
                onClick={handlePerformanceReportClick}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  display: "block",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
              >
                Report
              </button>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <button
                onClick={handleVacantPositionsClick}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  display: "block",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
              >
               Positions
              </button>
            </li>
          </ul>
        </div>
        <div style={{ flex: 1, padding: "20px", position: "relative" }}>
          {showHeading && (
            <div>
              <h2 className="text-center">Employee Dashboard</h2>
            </div>
          )}
          {showPerformanceReport && <EmployeeReport />}
          {showVacantPositions && <VacantPositions />}
          {showReview && <SelfReview />}
          {showDashboard && <Dashboard />}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
