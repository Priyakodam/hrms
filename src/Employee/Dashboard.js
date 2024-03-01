import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, collection, query, getDocs, orderBy } from 'firebase/firestore';

function Dashboard() {
  const location = useLocation();
  const [latestRemark, setLatestRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  useEffect(() => {
    setIsLoading(true);
    const db = getFirestore();
    // Fetch documents ordered by createdAt in descending order
    const q = query(collection(db, `metrics-${loggedInEmployeeId}`), orderBy('createdAt', 'desc'));

    getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Get the first document, which is the most recent one
          const mostRecentDoc = querySnapshot.docs[0].data();
          // Update state with the remarks of the most recent document
          setLatestRemark(mostRecentDoc.remarks);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
        setError(error);
        setIsLoading(false);
      });
  }, [loggedInEmployeeId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data!</p>;

  return (
    <div className="container">
      <h2>Performance Report</h2>
      {/* Display the most recent remarks */}
      <div>
        <h1>Remarks</h1>
        <p>{latestRemark}</p>
      </div>
    </div>
  );
}

export default Dashboard;