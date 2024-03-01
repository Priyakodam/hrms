import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './App'; // Import your Firestore database configuration
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const MarkAttendance = () => {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const loggedInEmployeeName = location.state?.loggedInEmployeeName;

  const [name, setName] = useState(loggedInEmployeeName || '');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toFirebaseTimestamp = (date) => {
    return Timestamp.fromDate(date);
  };

  const fromFirebaseTimestamp = (timestamp) => {
    return timestamp.toDate();
  };

  const handleUserNameChange = (event) => {
    setName(event.target.value);
  };

  const updateAttendanceInDB = async (records, status) => {
    if (!loggedInEmployeeId) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    const currentDate = new Date().toISOString().split('T')[0];

    // Retrieve the user document to get the assigned manager UID
    const userDocRef = doc(db, 'users', loggedInEmployeeId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const loggedInEmployee = userDocSnap.data();
      const assignedManagerUid = loggedInEmployee.assignedManagerUid;

      // Update employee's attendance
      const employeeAttendanceCollection = collection(db, `attendance_${loggedInEmployeeId}`);
      const employeeDateDoc = doc(employeeAttendanceCollection, `${currentDate}_${loggedInEmployeeId}`);

      const totalDurationHours = calculateTotalDurationInHours(records);
      const formattedTotalDuration = formatDuration(totalDurationHours);
      const isPresent = totalDurationHours >= 8;

      const recordsForFirebase = records.map((record) => ({
        checkIn: record.checkIn ? toFirebaseTimestamp(record.checkIn) : null,
        checkOut: record.checkOut ? toFirebaseTimestamp(record.checkOut) : null,
      }));

      try {
        // Update employee's attendance
        await setDoc(employeeDateDoc, {
          name: name,
          records: recordsForFirebase,
          totalDuration: formattedTotalDuration,
          status: status, // Use the passed status
          employeeUid: loggedInEmployeeId,
        });
      
        // Update assigned manager's attendance
        if (assignedManagerUid) {
          const managerAttendanceCollection = collection(db, `attendance_${assignedManagerUid}`);
          const managerDateDoc = doc(managerAttendanceCollection, `${currentDate}_${loggedInEmployeeId}`);
      
          try {
            await setDoc(managerDateDoc, { // Use managerDateDoc here
              name: name,
              records: recordsForFirebase,
              totalDuration: formattedTotalDuration,
              status: status, // Use the passed status
              employeeUid: loggedInEmployeeId,
            });
          } catch (error) {
            console.error('Error updating manager attendance data:', error);
          }
        }
      } catch (error) {
        console.error('Error updating employee attendance data:', error);
      }   
     } else {
      console.error('User not found');
    }

    setIsLoading(false);
  };

  const handleCheckIn = () => {
    const newRecords = [...attendanceRecords, { checkIn: new Date(), checkOut: null }];
    setAttendanceRecords(newRecords);
    updateAttendanceInDB(newRecords, 'P').then(() => { // Set status as 'P' on check-in
      window.alert('Successfully logged in!');
    });
  };
  
  const handleCheckOut = () => {
    const newRecords = [...attendanceRecords];
    const lastIndex = newRecords.length - 1;
    if (lastIndex >= 0 && !newRecords[lastIndex].checkOut) {
      newRecords[lastIndex].checkOut = new Date();
      setAttendanceRecords(newRecords);
      const totalDurationHours = calculateTotalDurationInHours(newRecords);
      const attendanceStatus = totalDurationHours >= 8 ? 'P' : 'A'; // Update status based on total duration
      updateAttendanceInDB(newRecords, attendanceStatus).then(() => {
        window.alert(`Successfully logged out! Status: ${attendanceStatus}`);
      });
    }
  };

  const calculateStatus = (records) => {
    const totalDurationHours = calculateTotalDurationInHours(records);
    return totalDurationHours >= 8;
  };

  const formatDuration = (durationHours) => {
    if (durationHours < 1) {
      // Convert to minutes and round off
      const minutes = Math.round(durationHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      // Round to two decimal places for hours
      const hoursRounded = Math.round(durationHours * 100) / 100;
      return `${hoursRounded} hour${hoursRounded !== 1 ? 's' : ''}`;
    }
  };

  const calculateTotalDurationInHours = (records) => {
    return records.reduce((total, record) => {
      if (record.checkIn && record.checkOut) {
        const checkIn = record.checkIn instanceof Date ? record.checkIn : fromFirebaseTimestamp(record.checkIn);
        const checkOut = record.checkOut instanceof Date ? record.checkOut : fromFirebaseTimestamp(record.checkOut);
        return total + (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    if (loggedInEmployeeId) {
      const currentDate = new Date().toISOString().split('T')[0];
      const attendanceCollection = collection(db, `attendance_${loggedInEmployeeId}`);
      const dateDoc = doc(attendanceCollection, `${currentDate}_${loggedInEmployeeId}`);

      getDoc(dateDoc).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const existingAttendance = docSnapshot.data();
          const recordsWithDates = existingAttendance.records.map((record) => ({
            checkIn: record.checkIn ? fromFirebaseTimestamp(record.checkIn) : null,
            checkOut: record.checkOut ? fromFirebaseTimestamp(record.checkOut) : null,
          }));
          setAttendanceRecords(recordsWithDates);
        }
      });
    }
  }, [loggedInEmployeeId]);

  return (
    <div>
    <h2>Mark Attendance</h2>
    <div>
      <Button
        variant="success"
        onClick={handleCheckIn}
        disabled={isLoading || (attendanceRecords.length > 0 && !attendanceRecords[attendanceRecords.length - 1].checkOut)}
      >
        Mark Check-In
      </Button>
      { " "}
      <Button
        variant="warning"
        onClick={handleCheckOut}
        disabled={isLoading || !attendanceRecords.length || attendanceRecords[attendanceRecords.length - 1].checkOut}
      >
        Mark Check-Out
      </Button>
    </div>
  </div>
);
};

export default MarkAttendance;
