import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerFinalSettlement from './ManagerFinalSettlement';

function FinalSettlementStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [settlementData, setSettlementData] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const handleModal = () => setShowModal(!showModal);


  useEffect(() => {
    const fetchSettlementData = async () => {
      if (!loggedInEmployeeId) return;

      const settlementCollectionRef = collection(db, `managersettlements_${loggedInEmployeeId}`);
      const settlementDocs = await getDocs(settlementCollectionRef);
      const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSettlementData(settlementData);
    };

    fetchSettlementData();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (setId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerSettlementRef = doc(db, `managersettlements_${loggedInEmployeeId}`, setId);
      await updateDoc(managerSettlementRef, { status: newStatus });

      // Update in the employee's collection
      const employeeSettlementRef = doc(db, `managersettlements_${employeeUid}`, setId);
      await updateDoc(employeeSettlementRef, { status: newStatus });

      // Update local state to reflect the new status
      setSettlementData(prevState =>
        prevState.map(settlement =>
          settlement.id === setId ? { ...settlement, status: newStatus } : settlement
        )
      );
    } catch (error) {
      console.error('Error updating settlement status:', error);
    }
  };

  const styles = {
    tableHeader: {
      padding: '8px',
      textAlign: 'left',
    },
    tableCell: {
      padding: '8px',
      textAlign: 'left',
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
      <div className="row justify-content-center">
        <div className="col-md-12 mt-3">
        <Button variant="primary" onClick={handleModal}>Apply For Resignation</Button> {/* Add Button */}
          <h4>Settlement Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>EmployeeId</th>
                <th>Employee Name</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {settlementData.map((data) => (
                <tr key={data.id}>
                  <td>{data.employeeId}</td>
                  <td>{data.employeeName}</td>
                  <td>{data.resignationDate}</td>
                  <td>{data.lastWorkingDay}</td>
                  <td>{data.reason}</td>
                  <td style={{ ...styles.tableCell, ...getStatusStyle(data.status) }}>
                    {data.status}
                  </td>
                  {/* <td style={styles.tableCell}>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(data.id, data.employeeUid, e.target.value)}
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
        {/* Modal for applying leave */}
        <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Resignation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerFinalSettlement />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default FinalSettlementStatus;
