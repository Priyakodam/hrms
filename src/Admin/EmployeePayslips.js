import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../App";
import { doc, getDoc, collection, getDocs, where, query } from "firebase/firestore";

function Payslip() {
  const location = useLocation();
  const [employeeData, setEmployeeData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = employeeData?.slice(firstIndex, lastIndex); // Use optional chaining to handle null employeeData
  const npage = Math.ceil((employeeData?.length || 0) / recordsPerPage); // Use optional chaining and provide default value for length
  const numbers = [...Array(npage + 1).keys()].slice(1);

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where('role', '==', 'Manager'));
        const managersSnapshot = await getDocs(managersQuery);
        const fetchedManagers = managersSnapshot.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName }));
        setManagers(fetchedManagers);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };
    fetchManagers();  
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const usersRef = collection(db, 'users');
        const employeesQuery = query(usersRef, where('role', '==', 'Employee'));
        const employeesSnapshot = await getDocs(employeesQuery);
        const fetchedEmployees = employeesSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);
  
  useEffect(() => {
    const fetchSettlementData = async () => {
      try {
        if (role === 'Manager') {
          let allSettlementData = []; 
          for (const manager of managers) {
            const settlementCollectionRef = collection(db, `payslip_${manager.uid}`); 
            const settlementDocs = await getDocs(settlementCollectionRef);
            const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allSettlementData = [...allSettlementData, ...settlementData];
            console.log("settlementData=",settlementData)
          }
  
          setEmployeeData(allSettlementData); 
        } else if (role === 'Employee' && selectedManager && selectedManager !== 'All') {
          console.log("Selected Manager:", selectedManager); // Log selected manager for debugging
          try {
            // Fetch settlement requests for the selected manager (if employee role and manager selected)
            const settlementCollectionRef = collection(db, `payslips_${selectedManager}`);
            console.log("settlementCollectionRef:", settlementCollectionRef); // Log collection reference for debugging
            const settlementDocs = await getDocs(settlementCollectionRef);
            
            if (!settlementDocs.empty) { // Check if documents exist in the collection
              const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setEmployeeData(settlementData);
              console.log("settlementData=", settlementData);
            } else {
              console.log("No settlement data found for selected manager");
              setEmployeeData([]); // Set empty array to indicate no data
            }
          } catch (error) {
            console.error('Error fetching settlement requests:', error);
            // Handle error here
          }
        }
        
         else if (role === 'Employee' && selectedManager === 'All') {
          // Fetch settlement requests for all employees
          let allSettlementData = []; // Accumulate data from all employees
  
          for (const employee of employees) {
            const settlementCollectionRef = collection(db, `payslips_${employee.id}`);
            const settlementDocs = await getDocs(settlementCollectionRef);
            const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allSettlementData = [...allSettlementData, ...settlementData];
          }
  
          setEmployeeData(allSettlementData); // Update state with accumulated data
        } else if (role === 'Employee') {
          // Fetch settlement requests for all employees
          let allSettlementData = []; // Accumulate data from all employees
  
          for (const employee of employees) {
            try {
              const settlementCollectionRef = collection(db, `payslips_${employee.id}`);
              console.log("settlementCollectionRef:", settlementCollectionRef);
              const settlementDocs = await getDocs(settlementCollectionRef);
              console.log("settlementDocs:", settlementDocs);
              const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              allSettlementData = [...allSettlementData, ...settlementData];
            } catch (error) {
              console.error(`Error fetching payslips for employee ${employee.uid}:`, error);
            }
          }
          
  
          setEmployeeData(allSettlementData); // Update state with accumulated data
        }
      } catch (error) {
        console.error('Error fetching settlement requests:', error);
      }
    };
  
    fetchSettlementData();
  }, [role, selectedManager, managers, employees]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager('');
    setEmployeeData([]);
  };

  const handleManagerChange = (event) => {
    setSelectedManager(event.target.value); // Ensure you're setting the id of the manager
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h2>Payslip Data</h2>
          <div className='row'>
            <div className='col-md-4'>
              <label htmlFor="roleSelect" className="form-label">Select Role:</label>
              <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
                <option value="" disabled>Select Role</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            {role === 'Employee' && (
              <>
                <div className='col-md-4'>
                  <label htmlFor="managerSelect" className="form-label" style={{ marginLeft: '10px' }}>Select Manager:</label>
                  <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                    <option value="" disabled>Select a Manager</option>
                    <option value="All">All Manager</option>
                    {managers.map(manager => (
                      <option key={manager.uid} value={manager.uid}>{manager.fullName}</option> // Set value to manager.uid
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          
           
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Date</th>
                    <th>Gross Salary</th>
                    <th>Net Salary</th>
                    <th>Total Deductions</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
  {records && records.map((employee) => (
    employee.payslips.map((payslip, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{employee.employeeId}</td>
        <td>{employee.fullName}</td>
        <td>{employee.role}</td>
        <td>{payslip.date}</td>
        <td>{payslip.grossSalary}</td>
        <td>{payslip.netSalary}</td>
        <td>{payslip.totalDeductions}</td>
        <td>
          {employee.pdfUrl && (
            <a
              href={employee.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
          )}
        </td>
      </tr>
    ))
  ))}
</tbody>
              </table>
              <nav aria-label="Page navigation example" style={{ position: "sticky", bottom: "5px", right: "10px", cursor: "pointer" }}>
                <ul className="pagination justify-content-end">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <a className="page-link" aria-label="Previous" onClick={prePage}>
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  {numbers.map((n, i) => (
                    <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                      <a className="page-link" onClick={() => changeCPage(n)}>
                        {n}
                      </a>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === npage ? "disabled" : ""}`}>
                    <a className="page-link" aria-label="Next" onClick={nextPage}>
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            
         
        </div>
      </div>
    </div>
  );
}

export default Payslip;
