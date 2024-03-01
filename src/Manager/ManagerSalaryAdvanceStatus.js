// SalaryAdvanceRequestStatus.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerSalaryAdvance from './ManagerSalaryAdvance';

function SalaryAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [salaryAdvanceRequests, setSalaryAdvanceRequests] = useState([]);
  const handleModal = () => setShowModal(!showModal);
  const [showModal, setShowModal] = useState(false); 

  useEffect(() => {
    // Fetch salary advance requests based on loggedInEmployeeId
    const fetchSalaryAdvanceRequests = async () => {
      const collectionRef = collection(db, `managersalaryadvance__${loggedInEmployeeId}`);
      const docs = await getDocs(collectionRef);
      const data = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalaryAdvanceRequests(data);
    };

    fetchSalaryAdvanceRequests();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (requestId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerRequestRef = doc(db, `managersalaryadvance_${loggedInEmployeeId}`, requestId);
      await updateDoc(managerRequestRef, { status: newStatus });

      // Update in the employee's collection
      const employeeRequestRef = doc(db, `managersalaryadvance_${employeeUid}`, requestId);
      await updateDoc(employeeRequestRef, { status: newStatus });

      // Update local state to reflect the new status
      setSalaryAdvanceRequests(prevState =>
        prevState.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Error updating salary advance request status:', error);
    }
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
        <Button variant="primary" onClick={handleModal}>Apply Salary Advance</Button> {/* Add Button */}
          <h4 id="welcome">Salary Advance Request Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                
                <th>Amount Requested</th>
                <th>Reason</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {salaryAdvanceRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.amountRequested}</td>
                  <td>{request.reason}</td>
                  <td style={{ ...getStatusStyle(request.status) }}>
                    {request.status}
                  </td>
                  {/* <td>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(request.id, request.employeeUid, e.target.value)}
                    >
                      <option value="" disabled>Choose Action</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td> */}
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
          <Modal.Title>salary advance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerSalaryAdvance />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SalaryAdvanceRequestStatus;
