import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Replace Redirect with Navigate
import "bootstrap/dist/css/bootstrap.min.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

import Login from "./Login";
import EmployeeDisplay from "./Admin/EmployeeDisplay";
import ManagerDisplay from "./Admin/ManagerDisplay";
import EmployeeRegistration from "./Admin/EmployeeRegistration";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./Admin/AdminDashboard";
import ManagerDashboard from "./Manager/ManagerDashBoard";
// import Dashboard from "./GeneralManager/Dashboard";
import HRDashboard from "./HR/HRDashboard";
import HRManagerDashboard from "./HR/HRManagerDashboard";
import TDManagerDashboard from "./T&DManager/TDManagerDashboard";

const firebaseConfig = {
  apiKey: "AIzaSyCfX8PxMS-fsEdVc3vte45m6_HRkQHIXRI",
  authDomain: "syconehrms.firebaseapp.com",
  databaseURL: "https://syconehrms-default-rtdb.firebaseio.com",
  projectId: "syconehrms",
  storageBucket: "syconehrms.appspot.com",
  messagingSenderId: "440196769987",
  appId: "1:440196769987:web:b5fd8f6d48c0becb275a76"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, getFirestore, auth };

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (authUser) => {
        setUser(authUser);
      },
      (error) => {
        console.error('Authentication error:', error);
      }
    );
  
    return () => unsubscribe();
  }, [auth]);
  

  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Login/>} />
       
         <Route path="/emp" element={<EmployeeDisplay/>} />
        <Route path="/manager" element={<ManagerDisplay/>} />
        <Route path="/Empregister" element={<EmployeeRegistration />} /> 
        <Route path="/AdminDashboard" element={<AdminDashboard/>} />
        <Route path="/ManagerDashboard" element={<ManagerDashboard/>} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard/>} />
        {/* <Route path="/Dashboard" element={<Dashboard/>} /> */}
        <Route path="/HRdashboard" element={<HRDashboard/>} />
        <Route path="/HRManagerDashboard" element={<HRManagerDashboard/>} />
        <Route path='/TDManagerDashboard' element={<TDManagerDashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
