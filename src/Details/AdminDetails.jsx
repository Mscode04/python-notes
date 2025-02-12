import React, { useEffect, useState } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDetails.css";

function AdminDetails() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "admins"));
        const adminsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminsList);
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast.error("Failed to load admin details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await deleteDoc(doc(db, "admins", id));
        setAdmins(admins.filter((admin) => admin.id !== id));
        toast.success("Admin deleted successfully.");
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast.error("Failed to delete admin.");
      }
    }
  };

  return (
    <div className="admindetails-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="admindetails-title">Admin Details</h1>
      {loading ? (
        <div className="admindetails-loading">
          <img
            src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif"
            alt="Loading..."
          />
        </div>
      ) : (
        <table className="admindetails-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button
                      className="admindetails-delete-button"
                      onClick={() => handleDelete(admin.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="admindetails-no-data">No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDetails;
