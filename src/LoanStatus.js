import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import Loan from './Loan';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [loanRequests, setLoanRequests] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const handleModal = () => setShowModal(!showModal);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = loanRequests.slice(firstIndex, lastIndex);
  const npage = Math.ceil(loanRequests.length / recordsPerPage);
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
    // Fetch loan and advance requests based on loggedInEmployeeId
    const fetchLoanRequests = async () => {
      const leaveCollectionRef = collection(db, `loan_advance_requests_${loggedInEmployeeId}`);
      const leaveDocs = await getDocs(leaveCollectionRef);
      const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanRequests(leaveData);
    };

    fetchLoanRequests();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `loan_advance_requests_${loggedInEmployeeId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update in the employee's collection
      const employeeLeaveApplicationRef = doc(db, `loan_advance_requests_${employeeUid}`, applicationId);
      await updateDoc(employeeLeaveApplicationRef, { status: newStatus });

      // Update local state to reflect the new status
      setLoanRequests(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating loan application status:', error);
    }
  };

  const styles = {
    tableHeader: {
      padding: '8px',
      textAlign: 'left',
    },
    tableCell: {
      padding: '8px',
      textAlign: 'center',
    },
  };

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
        <div className="col-md-12 ">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 id="welcome">Loan  Request </h3>
          <div>
          <Button variant="primary" onClick={handleModal}>+ Add Loan</Button> {/* Add Button */}
          </div>
      </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Amount </th>
                <th>Reason</th>
                <th> Repayment Plan</th>
                <th>Status</th>
              
              </tr>
            </thead>
            <tbody>
              {records.map((application,index) => (
                <tr key={application.id}>
                  <td>{index + 1}</td> 
                  <td>{application.amountRequested}</td>
                  <td>{application.reason}</td>
                  <td>{application.proposedRepaymentPlan}</td>
                  <td style={{ ...styles.tableCell, ...getStatusStyle(application.status) }}>
                    {application.status}
                  </td>
                  
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
      <div className="row r3"></div>
      {/* Modal for applying leave */}
      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Loan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Loan />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LoanAdvanceRequestStatus;
