import React, { useEffect, useState } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StaffDetails.css";

function StaffDetails() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Headquarters"));
        const staffList = [];
        querySnapshot.forEach((doc) => {
          const place = doc.data().place; // Get HQ name
          if (doc.data().staff) {
            doc.data().staff.forEach((staff) => {
              staffList.push({ ...staff, place }); // Add HQ name to each staff
            });
          }
        });
        setStaffs(staffList);
      } catch (error) {
        console.error("Error fetching staff details:", error);
        toast.error("Failed to load staff details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  return (
    <div className="staffdetails-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="staffdetails-title">Staff Details</h1>
      {loading ? (
        <div className="staffdetails-loading">
          <img
            src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif"
            alt="Loading..."
          />
        </div>
      ) : (
        <table className="staffdetails-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>HQ Name</th> {/* Added HQ name column */}
            </tr>
          </thead>
          <tbody>
            {staffs.length > 0 ? (
              staffs.map((staff, index) => (
                <tr key={index}>
                  <td>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{staff.phoneNumber}</td>
                  <td>{staff.address}</td>
                  <td>{staff.place}</td> {/* Display HQ name */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="staffdetails-no-data">No staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StaffDetails;
