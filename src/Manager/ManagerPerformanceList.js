import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../App";

function EmployeeDataTable() {
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      // Query the 'allemployeemetrics' collection and order by timestamp
      const employeeQuery = query(
        collection(db, "allemployeemetrics"),
        orderBy("timestamp", "asc")
      );
      const employeeQuerySnapshot = await getDocs(employeeQuery);

      // Map the data from the snapshot
      const employeeDataArray = employeeQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the data in the state
      setEmployeeData(employeeDataArray);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Employee Data Table</h2>
      <table className="table table-bordered border-dark">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Total Points</th>
            <th>Status</th>
           
            
          </tr>
        </thead>
        <tbody>
          {employeeData.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.employeeId}</td>
              <td>{employee.fullName}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>{employee.totalPoints}</td>
              <td>{employee.status}</td>
              
          
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeDataTable;
