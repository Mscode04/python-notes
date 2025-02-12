import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReportList.css'; // Import CSS for styling

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'Reports'));
      const reportsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsList);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const pin = prompt('Enter PIN to confirm deletion:');
    if (pin === '1234') { // Replace with your secure PIN logic
      await deleteDoc(doc(db, 'Reports', id));
      toast.success('Report deleted successfully');
      fetchReports(); // Refresh the list
    } else {
      toast.error('Incorrect PIN. Deletion canceled.');
    }
  };

  return (
    <div className="getyt">
    <div className="allreport-container">
      <ToastContainer />
      <h1>Reports</h1>
      {loading ? (
        <div className='loading-container'>
          <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="Loading..." />
        </div>
      ) : (
        <table className="allreport-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Staff Name</th>
              <th>Report Year</th>
              <th>Total Business</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="allreport-row">
                <td>{report.doctorName}</td>
                <td>{report.staff}</td>
                <td>{report.reportOfYear}</td>
                <td>{report.totalBusiness}</td>
                <td>{report.status}</td>
                <td>
                  <Link to={`/main/si-report/${report.id}`} className="allreport-view-button">
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="allreport-delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
}

export default ReportList;