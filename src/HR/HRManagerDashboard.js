import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt,faBars,faL} from "@fortawesome/free-solid-svg-icons";
import DailyAttendance from "../Manager/DailyAttendance"; 
import MonthlyAttendanceReport from "../Manager/MonthlyAttendanceReport";
import LeaveApplication from "../Manager/LeaveApplication";
import ManagerAttendance from "../Manager/ManagerAttendance";
import ManagerViewLeave from "../Manager/ManagerViewLeave";
import EmployeeProfile from '../EmployeeProfile';
import logo from "../Img/logohrms.png";
// import OverallDashboard from "./OverallDashboard";
import EmployeesList from "../Manager/EmployeesList";
import ManagerMonthlyAttendance from "../Manager/ManagerMonthlyAttendance";
import HRManagerNumbers from './HRManagerNumbers';
import InternalApplicants from './InternalApplicants';
import OnBoarding  from "./OnBoarding";
import Positions from "./Positions";
import ViewPolicy from './ViewPolicy';
import AnnualHRBudget from "./AnnualHRBudget";

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("overalldashboard");
  const sidebarHeight = window.innerHeight - 70;
  const [showAttendance, setShowAttendance] =useState(false);
 

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=",employeeData.fullName)
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  const toggleDropdown = (dropdownSetter, defaultPage) => {
    // Close the current dropdown if it's already open
    if (dropdownSetter === setShowAttendance && showAttendance) {
      setShowAttendance(false);
    } else {
      // Close all other dropdowns and non-dropdown elements
      resetAllDropdowns();
      // Toggle the current dropdown
      dropdownSetter((prevState) => !prevState);
      // Set the active page to the default page if provided
      if (defaultPage) {
        setActivePage(defaultPage);
      }
    }
  };

  const handleAttendanceAndLeave = () => {
    toggleDropdown(setShowAttendance,"managerattendance");
  };

 


  const handleLogout = () => {
    navigate("/");
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    
    resetAllDropdowns();
    
    if (page.includes("Attendance&Leave") || page === "managerattendance" || page === "managermonthlyattendance"|| page === "dailyattendance" || page === "monthlyattendancereport" || page === "managerattendance" || page === "managerviewleave" || page === "leaveApplication") {
      setShowAttendance(true);
    } 
   
  };

  const resetAllDropdowns = () => {  
    setShowAttendance(false);  
   
  };

  const menuItemStyle = (page) => ({
    padding: "10px", // Keep the padding for top, right, and bottom
    paddingLeft: isSidebarOpen ? "20px" : "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    width: '100%',
    fontWeight: 
    (showAttendance && page === "Attendance&Leave")  ? "bold" : activePage === page ? "bold" : "normal",
    backgroundColor: activePage === page ? "white" : ((showAttendance && page === "Attendance&Leave")  ? "lightgrey" : "transparent"),
    color:(showAttendance && page === "Attendance&Leave")  ? "#182566" : (activePage === page ? "#182566" : "white"),
    transition: "background-color 0.1s, color 0.1s",
    border: "none",
    borderRadius: '20px'
  });

  
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
          onClick={toggleSidebar}
          style={{ background: "none", border: "none", fontSize: "20px",color:'white' }}
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
      <div style={{ display: "flex", paddingTop: "70px" }}>
      <div 
  style={{
    width: isSidebarOpen ? "250px" : "60px",
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
          <li
            onClick={() => handlePageChange("overalldashboard")}
            style={menuItemStyle("overalldashboard")}
          >
            {isSidebarOpen && "Dashboard"}
          </li>
          <li
            onClick={() => handlePageChange("employeeprofile")}
            style={menuItemStyle("employeeprofile")}
          >
            {isSidebarOpen && "Profile"}
          </li>
          <li
            onClick={() => handlePageChange("employees")}
            style={menuItemStyle("employees")}
          >
            {isSidebarOpen && "Employees"}
          </li>
          <li
            onClick={() => handlePageChange("positionrequests")}
            style={menuItemStyle("positionrequests")}
          >
            {isSidebarOpen && "Position Requests"}
          </li>
          <li
            onClick={() => handlePageChange("internalselects")}
            style={menuItemStyle("internalselects")}
          >
            {isSidebarOpen && "Internal Selects"}
          </li>
          <li
            onClick={() => handlePageChange("onboardings")}
            style={menuItemStyle("onboardings")}
          >
            {isSidebarOpen && "Onboardings"}
          </li>
          <li
            onClick={() => handlePageChange("viewpolicy")}
            style={menuItemStyle("viewpolicy")}
          >
            {isSidebarOpen && "View Policy"}
          </li>
          <li
            onClick={() => handlePageChange("annualhrbudget")}
            style={menuItemStyle("annualhrbudget")}
          >
            {isSidebarOpen && " Annual HRBudget"}
          </li>
          <ul onClick={handleAttendanceAndLeave} 
          style={{
            ...menuItemStyle("Attendance&Leave"),
            flexDirection: showAttendance && isSidebarOpen ? "column" : "row",
            margin: 0, 
    
          }}
    >
      <span>
        {isSidebarOpen && "Leave&Attendance"}&nbsp;&nbsp;
        {showAttendance ? null : <span>&#9660;</span>}
        </span>
      {showAttendance && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px' }}>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managerattendance"); }}
          style={{ ...menuItemStyle("managerattendance"), color: activePage === "managerattendance" ? "#182566" : "black", backgroundColor: activePage === "managerattendance" ? "white" : "transparent" }}
        >
          My Attendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managermonthlyattendance"); }}
          style={{ ...menuItemStyle("managermonthlyattendance"), color: activePage === "managermonthlyattendance" ? "#182566" : "black", backgroundColor: activePage === "managermonthlyattendance" ? "white" : "transparent" }}
        >
          My Monthly Attendance
        </li>

          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("dailyattendance"); }}
          style={{ ...menuItemStyle("dailyattendance"), color: activePage === "dailyattendance" ? "#182566" : "black", backgroundColor: activePage === "dailyattendance" ? "white" : "transparent" }}
        >
          Employee DailyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("monthlyattendancereport"); }}
          style={{ ...menuItemStyle("monthlyattendancereport"), color: activePage === "monthlyattendancereport" ? "#182566" : "black", backgroundColor: activePage === "monthlyattendancereport" ? "white" : "transparent" }}
        >
          Employee MonthlyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managerviewleave"); }}
          style={{ ...menuItemStyle("managerviewleave"), color: activePage === "managerviewleave" ? "#182566" : "black", backgroundColor: activePage === "managerviewleave" ? "white" : "transparent" }}
        >
         My Leaves
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("leaveApplication"); }}
          style={{ ...menuItemStyle("leaveApplication"), color: activePage === "leaveApplication" ? "#182566" : "black", backgroundColor: activePage === "leaveApplication" ? "white" : "transparent" }}
        >
          Employee Leaves
        </li>
        </div>
    </div>
  )}
          </ul>
         
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
          {activePage === "overalldashboard" && <HRManagerNumbers
          // onInternalSelectsclick={handleInternalApplicantsClick}
          // onPositionsclick={handlePositionsClick}
          // onOnBoardingclick={handleOnboardingsClick}
          />}
          {activePage === "positionrequests" && <Positions />}
          {activePage === "employeeprofile" && <EmployeeProfile />}
          {activePage === "internalselects" && <InternalApplicants />}
          {activePage === "onboardings" && <OnBoarding />}
          {activePage === "viewpolicy" && <ViewPolicy />}
          {activePage === "annualhrbudget" && <AnnualHRBudget />}
          {activePage === "employees" && <EmployeesList loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName} />}
          {activePage === "managerattendance" && <ManagerAttendance />}
          {activePage === "managermonthlyattendance" && <ManagerMonthlyAttendance />}
          {activePage === "managerviewleave" && <ManagerViewLeave />}
          {activePage === "dailyattendance" && <DailyAttendance />}
          {activePage === "monthlyattendancereport" && <MonthlyAttendanceReport />}
          {activePage === "leaveApplication" && <LeaveApplication />}
          </div>
     
      </div>
    </div>
  );
}

export default ManagerDashboard;
