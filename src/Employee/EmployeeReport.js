import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getFirestore, collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../App";

function EmployeeReport() {
  const location = useLocation();
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  useEffect(() => {
    setIsLoading(true);
    const db = getFirestore();
    const q = query(collection(db, `metrics-${loggedInEmployeeId}`), orderBy("createdAt", "desc"));

    getDocs(q)
      .then((querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() });
        });
        setPerformanceData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError(error);
        setIsLoading(false);
      });
  }, [loggedInEmployeeId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data!</p>;

  return (
    <div className="container">
      <h2>Performance Report</h2>
      <table className="styled-table">
        <thead>
          <tr>
          <th>S.No</th>
            <th>Date</th>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Total Points</th>
            <th>Average Points</th>
            <th>Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((item, index) => (
            <tr key={item.id}>
                <td>{index+1}</td>
              <td>{item.date}</td>
              <td>{item.employeeId}</td>
              <td>{item.fullName}</td>
              <td>{item.role}</td>
              <td>{item.totalPoints}</td>
              <td>{item.averagePoints}</td>
              <td>{item.remarks}</td>
              <td>{item.status || "Not Reviewed"}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeReport;
