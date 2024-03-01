import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, onSnapshot, orderBy, query,where } from 'firebase/firestore';
import { db } from './App';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function EmployeeCommunication() {
  const location = useLocation();  // Use useLocation hook
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [employeeData, setEmployeeData] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  console.log("MANAGER=",employeeData.assignedManager)

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=",employeeData.fullName)
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          // where('department', '==', 'Development'),
          // where('role', 'in', ['Employee', 'Manager']) 
          // You can add more conditions here if needed
        );
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs
          .map(doc => {
            const userData = { id: doc.id, ...doc.data() };
            console.log('User ID:', userData.id); // Log user ID to the console
            return userData;
          })
          .filter(user => user.fullName !== loggedInEmployeeName);
  
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };
  
    fetchUsers();
  }, [loggedInEmployeeName]);
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (loggedInEmployeeId && selectedUser) {
        const chatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const messagesQuery = query(chatCollection, orderBy('timestamp'));

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
          const newMessages = querySnapshot.docs.map((doc) => doc.data());
          setMessages(newMessages);
        });

        return () => unsubscribe(); // Cleanup the listener when component unmounts
      }
    };

    fetchMessages();
  }, [loggedInEmployeeId, selectedUser]);

  const handleUserSelection = (userId) => {
    const selectedUserData = users.find(user => user.id === userId);
    setSelectedUser(selectedUserData);
    if (selectedUserData) {
      console.log('Selected User UID:', selectedUserData.id);
    }
  };

  const handleSendMessage = async (message) => {
    if (selectedUser) {
      try {
        const chatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const messageData = {
          sender: loggedInEmployeeName,
          content: message,
          timestamp: Timestamp.now(),
        };

        await addDoc(chatCollection, messageData);
        setMessageInput(''); // Clear the input after sending the message
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar with user names */}
      <div className="sidebar">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserSelection(user.id)}
              className={selectedUser && selectedUser.id === user.id ? 'selected' : ''}
            >
              {user.fullName}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {selectedUser && (
          <div>
            <div className="chat-header">
              <h3>{selectedUser.fullName}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message" style={{
                  textAlign: msg.sender === loggedInEmployeeName ? 'right' : 'left',
                  backgroundColor: msg.sender === loggedInEmployeeName ? '#e0e0e0' : '#d4edda',
                  padding: '8px',
                  borderRadius: '8px',
                  margin: '8px',
                }}>
                 {msg.content}
                 <br />
                  <small>{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</small> 
              </div>
              ))}
            </div>

            <div className="chat-input-container">  
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{ position: 'absolute', bottom: '4vh', width: 'calc(69% - 40px)', height: '47px' }}
              />
              <div className="input-group-append" style={{ position: 'absolute', bottom: '4vh', right: '2vw' }}>
                <div className="input-group-text">
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    size="2x"
                    onClick={() => handleSendMessage(messageInput)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeCommunication;
