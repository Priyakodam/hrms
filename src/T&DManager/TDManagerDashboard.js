import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import TDManagerTrainingList from './TDManagerTrainingList';
import TrainingEvaluation from './TrainingEvaluation';
import TrainingEvaluationReport from './TrainingEvaluationReport';
import ReviewReportFromEmployee from './ReviewReportFromEmployee';
import logo from "../Img/logohrms.png"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faSignOutAlt,faBars,faL,} from "@fortawesome/free-solid-svg-icons";

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  console.log("loggedInEmployeeId=", loggedInEmployeeId);
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [showHeading, setShowHeading] = useState(true);
  const [showTDManagerTrainingList, setShowTDManagerTrainingList] = useState(false);
  const [showTrainingEvaluation, setShowTrainingEvaluation] = useState(false);
  const [showTrainingEvaluationReport, setShowTrainingEvaluationReport] = useState(false);
  const [showReportFromEmployee, setShowReportFromEmployee] = useState(false);
  const [showAnnualHRBudget, setShowAnnualHRBudget] = useState(false);
  const [showTrainingSubMenu, setShowTrainingSubMenu] = useState(false);
  const [trainingList, setTrainingList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarHeight = window.innerHeight - 60;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTrainingAndDevelopmentClick = () => {
    setShowTrainingSubMenu(!showTrainingSubMenu);
    setShowHeading(!showHeading);
    setShowTDManagerTrainingList(false);
    setShowTrainingEvaluation(false);
    setShowTrainingEvaluationReport(false);
    setShowReportFromEmployee(false);
    setShowAnnualHRBudget(false);
  };

  const handleDashboardClick = () => {
    setShowHeading(true);
    setShowTDManagerTrainingList(false);
    setShowTrainingEvaluation(false);
    setShowTrainingEvaluationReport(false);
    setShowReportFromEmployee(false);
    setShowAnnualHRBudget(false);
  };

  const handleManagerTrainingListClick = () => {
    setShowHeading(false);
    setShowTDManagerTrainingList(true);
    setShowTrainingEvaluation(false);
    setShowTrainingEvaluationReport(false);
    setShowReportFromEmployee(false);
    setShowAnnualHRBudget(false);
  };

  const handleTrainingEvaluationClick = () => {
    setShowTrainingEvaluation(true);
    setShowHeading(false);
    setShowTDManagerTrainingList(false);
    setShowTrainingEvaluationReport(false);
    setShowReportFromEmployee(false);
    setShowAnnualHRBudget(false);
  };

  const handleTrainingEvaluationReportClick = () => {
    setShowTrainingEvaluationReport(true);
    setShowTrainingEvaluation(false);
    setShowHeading(false);
    setShowTDManagerTrainingList(false);
    setShowReportFromEmployee(false);
    setShowAnnualHRBudget(false);
  };

  const handleReportFromEmployeeClick = () => {
    setShowReportFromEmployee(true);
    setShowTrainingEvaluationReport(false);
    setShowTrainingEvaluation(false);
    setShowHeading(false);
    setShowTDManagerTrainingList(false);
    setShowAnnualHRBudget(false);
  };

  const handleAnnualHRBudgetClick = () => {
    setShowAnnualHRBudget(true);
    setShowReportFromEmployee(false);
    setShowTrainingEvaluationReport(false);
    setShowTrainingEvaluation(false);
    setShowHeading(false);
    setShowTDManagerTrainingList(false);
    setShowTrainingSubMenu(false)
  };

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  const fetchTrainingList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'traininglist'));
      const trainingListData = querySnapshot.docs
        .filter(doc => doc.data().trainer === loggedInEmployeeName)
        .map(doc => ({ id: doc.id, ...doc.data() }));
  
      setTrainingList(trainingListData);
    } catch (error) {
      console.error('Error fetching training list: ', error);
    }
  };
  useEffect(() => {
    fetchTrainingList();
  }, [loggedInEmployeeName]);

  const handleNoOfTrainingsClick = () => {
    setShowTDManagerTrainingList(!showTDManagerTrainingList);
    setShowHeading(false); 
    // ... (other setShow... calls if needed) 
  };

  return (
    <div>
        <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#182566",
          padding: "10px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
       <button
  onClick={toggleSidebar} // Pass toggleSidebar to the onClick handler
  style={{ background: "none", border: "none", fontSize: "20px", color: "white" }}
>
  <FontAwesomeIcon icon={faBars} />
</button>

        <img
          src={logo}
          alt="Logo"
          style={{ height: "50px", width: "130px", marginLeft: "20px" }}
        />
       <div style={{ marginLeft: "auto" }}>
        <span onClick={handleLogout} className="logoutButton" style={{ color: "white",background:'#182566', }}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </span>
      </div>
      </div>
   
      <div style={{ display: "flex", paddingTop: "70px" ,}}>
  <div 
  style={{
    width: isSidebarOpen ? "230px" : "60px",
    backgroundColor: "#182566",
    color: 'white',
    paddingTop: '10px',
    height: `${sidebarHeight}px`, 
    overflowY: "auto", 
    position: "fixed",
    top: "70px",
    zIndex: 1001,
    transition: "width 0.3s",
    paddingRight: isSidebarOpen ? "15px" : "0px", 
    paddingLeft: isSidebarOpen ? "25px" : "0px", 
  }}
>
{isSidebarOpen && <h3 className="text-center">{loggedInEmployeeName}</h3>} 
        
        
        
        
            <li onClick={handleDashboardClick} 
             style={{
              padding: "10px", 
              paddingLeft: isSidebarOpen ? "20px" : "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: '100%',
              transition: "background-color 0.1s, color 0.1s",
              border: "none",
              borderRadius: '20px',
              background: showHeading ? "white" : "transparent",
              color: showHeading ? "#182566" : "white",
              fontWeight: showHeading ? "bold" : "normal",
              
            }}>
           Dashboard
            </li>
          
          
            <li onClick={handleManagerTrainingListClick} 
             style={{
              padding: "10px", 
              paddingLeft: isSidebarOpen ? "20px" : "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: '100%',
              transition: "background-color 0.1s, color 0.1s",
              border: "none",
              borderRadius: '20px',
              background: showTDManagerTrainingList ? "white" : "transparent",
              color: showTDManagerTrainingList ? "#182566" : "white",
              fontWeight: showTDManagerTrainingList ? "bold" : "normal",
              
            }}>
           Training List
            </li>
          
          
            <li onClick={handleTrainingEvaluationClick} 
             style={{
              padding: "10px", 
              paddingLeft: isSidebarOpen ? "20px" : "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: '100%',
              transition: "background-color 0.1s, color 0.1s",
              border: "none",
              borderRadius: '20px',
              background: showTrainingEvaluation ? "white" : "transparent",
              color: showTrainingEvaluation ? "#182566" : "white",
              fontWeight: showTrainingEvaluation ? "bold" : "normal",
              
            }}>
           Training Evaluation
            </li>
         
          
            <li onClick={handleTrainingEvaluationReportClick} 
             style={{
              padding: "10px", 
              paddingLeft: isSidebarOpen ? "20px" : "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: '100%',
              transition: "background-color 0.1s, color 0.1s",
              border: "none",
              borderRadius: '20px',
              background: showTrainingEvaluationReport ? "white" : "transparent",
              color: showTrainingEvaluationReport ? "#182566" : "white",
              fontWeight: showTrainingEvaluationReport ? "bold" : "normal",
              
            }}>
           Evaluation Report
            </li>
          
          
            <li onClick={handleReportFromEmployeeClick} 
             style={{
              padding: "10px", 
              paddingLeft: isSidebarOpen ? "20px" : "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: '100%',
              transition: "background-color 0.1s, color 0.1s",
              border: "none",
              borderRadius: '20px',
              background: showReportFromEmployee ? "white" : "transparent",
              color: showReportFromEmployee ? "#182566" : "white",
              fontWeight: showReportFromEmployee ? "bold" : "normal",
             
            }}>
           Employee FeedBack
            </li>
          
         
          
      </div>
      <div
          style={{
            flex: 1,
            padding: "20px",
            marginLeft: isSidebarOpen ? "240px" : "60px",
            transition: "margin-left 0.3s",
            // position: "fixed",
            width: '84%'
          }}
        >
        
        {showHeading && (
          <div className="container">
          <div className="row">
          <div className="col-md-3" onClick={handleNoOfTrainingsClick}>
  <div className="box" style={{
    border: '1px solid #ddd',
    padding: '30px',
    marginBottom: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: '#182566',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  }}>
    <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
      Scheduled Trainings
    </h4>
    <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
    {trainingList.length}
    </span>
  </div>
</div>

          </div>
        </div>
        )}
        {showTDManagerTrainingList && <TDManagerTrainingList loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
        {showTrainingEvaluation && <TrainingEvaluation loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
        {showTrainingEvaluationReport && <TrainingEvaluationReport loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
        {showReportFromEmployee && <ReviewReportFromEmployee loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
        {/* {showAnnualHRBudget && <AnnualHRBudget loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>} */}
      </div>
    </div>
    </div>
  );
}

export default ManagerDashboard;
