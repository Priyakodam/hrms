import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { collection, addDoc, getDocs, query, orderBy,deleteDoc,doc,updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";



function TrainingType() {
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingEvaluation, setTrainingEvaluation] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [selectedTrainingConduction, setSelectedTrainingConduction] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [typeError, setTypeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrainingTypes, setFilteredTrainingTypes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState(null);

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = (filteredTrainingTypes.length > 0 ? filteredTrainingTypes : trainingTypes).slice(firstIndex, lastIndex);
  const npage = Math.ceil((filteredTrainingTypes.length > 0 ? filteredTrainingTypes.length : trainingTypes.length) / recordsPerPage);
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

  const handleCloseAddRoleModal = () => {
    setShowAddRoleModal(false);
    setType('');
    setDescription('');
    setStatus('');
    setDuration('');
    setDurationUnit('select');
    setStartDate('');
    setEndDate('');
    setTypeError('');
    setIsEditMode(false);
    setEditingTrainingId(null);
  }

  const fetchTrainingEvaluation = async () => {
    try {
      const q = query(collection(db, "trainingConduction"), orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);

      const evaluationData = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        sno: index + 1,
        ...doc.data(),
      }));

      setTrainingEvaluation(evaluationData);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
    }
  };

  useEffect(() => {
    fetchTrainingEvaluation();
  }, []);

  const handleOpenAddRoleModal = () => setShowAddRoleModal(true);

  const validateTrainingTitle = (title) => {
    // Allow alphanumeric characters including numbers, but ensure at least one letter is present
    const alphanumericPattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/;
    return alphanumericPattern.test(title);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateTrainingTitle(type)) {
      setTypeError('Training Title should only contain letters and spaces.');
      setIsSubmitting(false);
      return;
    } else {
      setTypeError('');
    }

    try {
      const selectedTrainingConductionData = trainingEvaluation.find(
        (evaluation) => evaluation.id === selectedTrainingConduction
      );

      const selectedTrainerData = trainers.find(
        (trainer) => trainer.id === selectedTrainer
      );

      const timestamp = new Date().toLocaleString();

      if (isEditMode && editingTrainingId) {
        // Update existing training type
        const trainingDocRef = doc(db, 'trainingtype', editingTrainingId);
        await updateDoc(trainingDocRef, {
          type,
          description,
          status,
          duration,
          durationUnit,
          startDate,
          endDate,
          trainingConduction: selectedTrainingConductionData?.parameter || '',
          trainer: selectedTrainerData?.fullName || '',
          timestamp: timestamp,
        });
        console.log('Training Type updated with ID: ', editingTrainingId);
      } else {
        // Add new training type
        const docRef = await addDoc(collection(db, 'trainingtype'), {
          type,
          description,
          status,
          duration,
          durationUnit,
          startDate,
          endDate,
          trainingConduction: selectedTrainingConductionData?.parameter || '',
          trainer: selectedTrainerData?.fullName || '',
          timestamp: timestamp,
        });
        console.log('Training Type added with ID: ', docRef.id);
      }

      setType('');
      setDescription('');
      setStatus('');
      setDuration('');
      setDurationUnit('select');
      setStartDate('');
      setEndDate('');
      setSelectedTrainingConduction('');
      setSelectedTrainer('');
      handleCloseAddRoleModal();
      fetchTrainingTypes();
      window.alert(isEditMode ? 'Training updated Successfully' : 'Training added Successfully');
    } catch (error) {
      console.error('Error adding/updating training type: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchTrainingTypes = async () => {
    try {
      const q = query(collection(db, 'trainingtype'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const typesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTrainingTypes(typesData);
    } catch (error) {
      console.error('Error fetching training types: ', error);
    }
  };

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  useEffect(() => {
    const fetchManagersInDevelopment = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs
          .map(doc => {
            const userData = { id: doc.id, ...doc.data() };
            console.log('User ID:', userData.id);
            return userData;
          })
          .filter(user => user.department === 'Training and Development');

        setTrainers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchManagersInDevelopment();
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Function to filter training types based on search query
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = trainingTypes.filter(type =>
      type.type.toLowerCase().includes(query) ||
      type.description.toLowerCase().includes(query) ||
      type.trainer.toLowerCase().includes(query) ||
      formatDate(type.startDate).includes(query) ||
      formatDate(type.endDate).includes(query) ||
      type.duration.toLowerCase().includes(query) ||
      type.trainingConduction.toLowerCase().includes(query)
    );
    setFilteredTrainingTypes(filtered);
    setCurrentPage(1); // Reset pagination to the first page when searching
  };

  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this training type?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'trainingtype', id));
        console.log('Training Type deleted with ID: ', id);
        fetchTrainingTypes();
        window.alert('Training Type deleted Successfully');
      } catch (error) {
        console.error('Error deleting training type: ', error);
      }
    }
  };
  
  const handleEdit = (id) => {
    const trainingToEdit = trainingTypes.find(training => training.id === id);
    if (trainingToEdit) {
      setType(trainingToEdit.type);
      setDescription(trainingToEdit.description);
      setStatus(trainingToEdit.status);
      setDuration(trainingToEdit.duration);
      setDurationUnit(trainingToEdit.durationUnit);
      setStartDate(trainingToEdit.startDate);
      setEndDate(trainingToEdit.endDate);
      setSelectedTrainingConduction(trainingEvaluation.find(evaluation => evaluation.parameter === trainingToEdit.trainingConduction)?.id || '');
      setSelectedTrainer(trainers.find(trainer => trainer.fullName === trainingToEdit.trainer)?.id || '');
      setIsEditMode(true);
      setEditingTrainingId(id);
      setShowAddRoleModal(true);
    }
  };
  

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Training Type</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <input
    type="text"
    className="form-control"
    placeholder="Search..."
    onChange={handleSearch}
    style={{ width: '150px', marginRight: '10px' }}
  />
  <button className="btn btn-primary" onClick={handleOpenAddRoleModal} style={{ marginRight: '10px' }}>+ Add</button>
</div>

      </div>

      <Modal show={showAddRoleModal} onHide={handleCloseAddRoleModal} size="lg">
      <Modal.Header closeButton>
          {/* <Modal.Title>{isEditMode ? 'Edit Training Type' : 'Add Training Type'}</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <h4 className='text-center'> {isEditMode ? 'Edit Training Type' : 'Add Training Type'}</h4>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Training Title</label>
              <input
                type="text"
                className="form-control"
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className='row mb-3'>
              <div className="col">
                <label htmlFor="trainer" className="form-label">Trainer</label>
                <select
                  className="form-select"
                  id="trainer"
                  name="trainer"
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label htmlFor="trainingConduction" className="form-label">Training Conduction</label>
                <select
                  className="form-select"
                  id="trainingConduction"
                  name="trainingConduction"
                  value={selectedTrainingConduction}
                  onChange={(e) => setSelectedTrainingConduction(e.target.value)}
                  required
                >
                  <option value="" disabled>Select </option>
                  {trainingEvaluation.map((evaluation) => (
                    <option key={evaluation.id} value={evaluation.id}>
                      {evaluation.parameter}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='row mb-3'>
              <div className="col">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getCurrentDate()}
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getCurrentDate()}
                  required
                />
              </div>
            </div>
            <div className='row mb-3'>
            <div className="col">
              <label htmlFor="duration" className="form-label">Training Duration</label>
              <input
                type="text"
                className="form-control"
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="col">
              <label htmlFor="duration" className="form-label">Duration Unit</label>
              <select
                  className="form-select"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                   <option value="select"disabled>Select</option>
                  <option value="hours">Hour</option>
                  <option value="week">Week</option>
                  <option value="days">Days</option>
                </select>
            </div>
            </div>
            <div className="text-center">
              <Button variant="danger" onClick={handleCloseAddRoleModal} style={{ marginRight: '2px' }}>Close</Button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>

      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Training Title</th>
            <th>Description</th>
            <th>Trainer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Training Duration</th>
            <th>Training Conduction</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  {records.map((trainingType, index) => (
    <tr key={trainingType.id}>
      <td>{firstIndex + index + 1}</td>
      <td>{trainingType.type}</td>
      <td>{trainingType.description}</td>
      <td>{trainingType.trainer}</td>
      <td>{formatDate(trainingType.startDate)}</td>
      <td>{formatDate(trainingType.endDate)}</td>
      <td>{trainingType.duration} {trainingType.durationUnit}</td>
      <td>{trainingType.trainingConduction}</td>
      <td>
      <Button variant="info" onClick={() => handleEdit(trainingType.id)}>
                    <FontAwesomeIcon icon={faPen} />
                  </Button>{' '}
        <Button variant="danger" onClick={() => handleDelete(trainingType.id)}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
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
  );
}

export default TrainingType;
