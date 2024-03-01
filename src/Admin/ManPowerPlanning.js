import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../App";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";

const ManPowerTable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "MPR"));
        const newData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(newData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (item) => {
    console.log("Edit item:", item); // Debug log
    setEditData({
      ...item,
      date: item.date || "",
      status: item.status || "Open", // Default to 'Open' if status is not set
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "MPR", id));
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  useEffect(() => {
    console.log("Current editData:", editData);
  }, [editData]);

  const handleSave = async () => {
    if (!editData || !editData.id) {
      console.error("Invalid editData or missing id property", editData);
      return;
    }

    const selectedDate = new Date(editData.date);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      // If the selected date is in the past, change status to 'Closed'
      editData.status = "Closed";
    }
  

    try {
      const docRef = doc(db, "MPR", editData.id);
      await updateDoc(docRef, { ...editData });

      setData((prevData) =>
        prevData.map((item) =>
          item.id === editData.id ? { ...item, ...editData } : item
        )
      );

      setShowModal(false);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-center">Man Power Requests</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Position Name</th>
            <th>Department</th>
            <th>Position Count</th>
            <th>Budget</th>
            <th>Min Experience</th>
            <th>Max Experience</th>
            <th>Min Qualification</th>
            <th>Max Qualification</th>
            <th>Job Description</th>
            <th>Location</th>
            <th>Manager</th>
            <th>Action</th>
            <th>Closing Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.positionName}</td>
              <td>{item.department}</td>
              <td>{item.positionCount}</td>
              <td>{item.budget}</td>
              <td>{item.minExperience}</td>
              <td>{item.maxExperience}</td>
              <td>{item.minQualification}</td>
              <td>{item.maxQualification}</td>
              <td>{item.jobDescription}</td>
              <td>{item.location}</td>
              <td>{item.manager}</td>

              <td>
                <FontAwesomeIcon
                  icon={faPen}
                  onClick={() => handleEditClick(item)}
                />
                &nbsp;&nbsp;
                <FontAwesomeIcon
                  icon={faTrash}
                  onClick={() => handleDelete(item.id)}
                />
              </td>
              <td>{item.date}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Man Power Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row">
              <div className=" col-6 form-group">
                <label>Position Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.positionName}
                  onChange={(e) =>
                    setEditData({ ...editData, positionName: e.target.value })
                  }
                />
              </div>

              <div className=" col-6 form-group">
                <label>Department:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.department}
                  onChange={(e) =>
                    setEditData({ ...editData, department: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-6 form-group">
                <label>Position Count:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editData.positionCount}
                  onChange={(e) =>
                    setEditData({ ...editData, positionCount: e.target.value })
                  }
                />
              </div>

              <div className="col-6 form-group">
                <label>Budget:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editData.budget}
                  onChange={(e) =>
                    setEditData({ ...editData, budget: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="row ">
              <div className="col-6 form-group">
                <label>Min Experience:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editData.minExperience}
                  onChange={(e) =>
                    setEditData({ ...editData, minExperience: e.target.value })
                  }
                />
              </div>

              <div className="col-6 form-group">
                <label>Max Experience:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editData.maxExperience}
                  onChange={(e) =>
                    setEditData({ ...editData, maxExperience: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="col-6 form-group">
                <label>Min Qualification:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.minQualification}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      minQualification: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-6 form-group">
                <label>Max Qualification:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.maxQualification}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      maxQualification: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-6 form-group">
                <label>Job Description:</label>
                <textarea
                  className="form-control"
                  value={editData.jobDescription}
                  onChange={(e) =>
                    setEditData({ ...editData, jobDescription: e.target.value })
                  }
                />
              </div>

              <div className="col-6 form-group">
                <label>Location:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                />
              </div>
            </div>
            {/* <div className="form-group">
          <label>Manager:</label>
          <input
            type="text"
            className="form-control"
            value={editData.manager}
            onChange={(e) => setEditData({ ...editData, manager: e.target.value })}
          />
        </div> */}

            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                className="form-control"
                value={editData.date}
                onChange={(e) =>
                  setEditData({ ...editData, date: e.target.value })
                }
              />
            </div>

            {/* New Status Dropdown Field */}
            <div className="form-group">
              <label>Status:</label>
              <select
                className="form-control"
                value={editData.status}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManPowerTable;
