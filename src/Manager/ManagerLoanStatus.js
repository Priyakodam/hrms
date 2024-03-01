import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerLoan from './ManagerLoan';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [loanRequests, setLoanRequests] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const handleModal = () => setShowModal(!showModal);

  useEffect(() => {
    // Fetch loan and advance requests based on loggedInEmployeeId
    const fetchLoanRequests = async () => {
      const leaveCollectionRef = collection(db, `managerloan_${loggedInEmployeeId}`);
      const leaveDocs = await getDocs(leaveCollectionRef);
      const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanRequests(leaveData);
    };

    fetchLoanRequests();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `managerloan_${loggedInEmployeeId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update in the employee's collection
      const employeeLeaveApplicationRef = doc(db, `managerloan_${employeeUid}`, applicationId);
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
        <div className="col-md-12 mt-3">
        <Button variant="primary" onClick={handleModal}>Add Loan</Button> {/* Add Button */}
          <h4 id="welcome">Loan  Request </h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Amount </th>
                <th>Reason</th>
                <th> Repayment Plan</th>
                <th>Status</th>
              
              </tr>
            </thead>
            <tbody>
              {loanRequests.map((application) => (
                <tr key={application.id}>
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
        </div>
      </div>
      <div className="row r3"></div>
      {/* Modal for applying leave */}
      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Loan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerLoan />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LoanAdvanceRequestStatus;
