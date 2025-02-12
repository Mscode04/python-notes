import React, { useState } from 'react';
import { db } from "../Firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom'; // Use useNavigate for navigation
import { ToastContainer, toast } from 'react-toastify'; // Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Toast styles
import './Admin.css'; // Import separate CSS file

function Admin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Use useNavigate for navigation

  const generateId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    const adminId = generateId();

    try {
      await addDoc(collection(db, "admins"), {
        id: adminId,
        name: name,
        email: email,
        password: password, // Note: In a real-world scenario, use Firebase Authentication for passwords.
      });
      toast.success('Admin registered successfully!'); // Success toast
      setTimeout(() => {
        navigate(-1); // Navigate back to the previous page after a short delay
      }, 2000); // Delay for 2 seconds to show the success toast
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error('Error registering admin. Please try again.'); // Error toast
    } finally {
      setLoading(false); // Set loading to false after submission
    }
  };

  return (
    <div className="adminreg-container">
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="adminreg-header">
        {/* Back button with navigate(-1) */}
        <button className="adminreg-back-button" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="adminreg-title">Admin Registration</h1>
      </div>

      <form className="adminreg-form" onSubmit={handleSubmit}>
        <div className="adminreg-form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="adminreg-input"
          />
        </div>
        <div className="adminreg-form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="adminreg-input"
          />
        </div>
        <div className="adminreg-form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="adminreg-input"
          />
        </div>
        <button type="submit" className="adminreg-submit-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Admin;