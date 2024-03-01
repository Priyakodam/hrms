// ExpenseReportsTable.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import Expenses from './Expenses';

function ExpenseReportsTable() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [expenseReports, setExpenseReports] = useState([]);
  const [showModal, setShowModal] = useState(false); 

  const handleModal = () => setShowModal(!showModal);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = expenseReports.slice(firstIndex, lastIndex);
  const npage = Math.ceil(expenseReports.length / recordsPerPage);
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
    const fetchExpenseReports = async () => {
      const expenseCollectionRef = collection(db, `expenses_${loggedInEmployeeId}`);
      const expenseDocs = await getDocs(expenseCollectionRef);
      const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenseReports(expenseData);
    };

    fetchExpenseReports();
  }, [loggedInEmployeeId]);



  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'Rejected':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return { color: 'black', fontWeight: 'bold' };
    }
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 id="welcome">Expense Reports</h4>
          <div>
          <Button variant="primary" onClick={handleModal}>+   Add Expense</Button> {/* Add Button */}
          </div>
          </div>
         
          <table className="styled-table">
            <thead>
              <tr>
              <th>S.No</th>
                <th>Date of Expense</th>
                <th>Expense Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Receipt URL</th>
                <th>Status</th>
                
              </tr>
            </thead>
            <tbody>
              {records.map((report,index) => (
                <tr key={report.id}>
                   <td>{index + 1}</td> 
                  <td>{report.dateOfExpense}</td>
                  <td>{report.expenseCategory}</td>
                  <td>{report.amount}</td>
                  <td>{report.description}</td>
                  <td>
                    <a href={report.receiptUrl} target="_blank" rel="noopener noreferrer">
                      View Receipt
                    </a>
                  </td>
                  <td style={{ ...getStatusStyle(report.status) }}>{report.status}</td>
                  
                </tr>
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
      <div className="row r3">

      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title> Expenses</Modal.Title>
        </Modal.Header>
        <Modal.Body className='col-lg'>
          <Expenses />
        </Modal.Body>
      </Modal>
      </div>
    </div>
  );
}

export default ExpenseReportsTable;
