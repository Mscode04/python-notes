import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { doc, getDoc ,deleteDoc} from 'firebase/firestore';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReportView.css'; // Import CSS for styling

function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    const docRef = doc(db, 'Reports', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setReport({ id: docSnap.id, ...docSnap.data() });
    } else {
      toast.error('Report not found');
    }
  };

  const handleDelete = async () => {
    const pin = prompt('Enter PIN to confirm deletion:');
    if (pin === '1234') { // Replace with your secure PIN logic
      await deleteDoc(doc(db, 'Reports', id));
      toast.success('Report deleted successfully');
      navigate(-1); // Redirect to list page
    } else {
      toast.error('Incorrect PIN. Deletion canceled.');
    }
  };

  if (!report) return <div>Loading...</div>;

  return (
    <div className="view-report-container">
      <ToastContainer />
      <h1>Report Details</h1>
      <div className="report-details">
        <h2>General Details</h2>
        <p>Report Year: {report.reportOfYear}</p>

        <h2>Doctor Details</h2>
        <p>Doctor Name: {report.doctorName}</p>
        <p>Address: {report.address}</p>
        <p>Phone: {report.phone}</p>
        <p>Designation: {report.designation}</p>
        <p>Area: {report.area}</p>
        <p>Headquarters: {report.headquarters}</p>
        <p>Staff: {report.staff}</p>

        <h2>Activity Details</h2>
        <p>Month: {report.activityMonth}</p>
        <p>Day: {report.activityDay}</p>
        <p>Amount: {report.activityAmount}</p>
        <p>MR: {report.mr}</p>
        <p>ABM: {report.abm}</p>
        <p>RSM: {report.rsm}</p>
        <p>Targeted Times: {report.targetedTimes}</p>

        <h2>Prescribed Products</h2>
        <ul>
          {report.prescribedProducts.map((product, index) => (
            <li key={index}>{product}</li>
          ))}
        </ul>

        <h2>Targeted Products</h2>
        <ul>
          {report.targetedProducts.map((product, index) => (
            <li key={index}>{product}</li>
          ))}
        </ul>

        <h2>Last Year Amount</h2>
        <p>Amount: {report.lastYearAmount}</p>

        <h2>Dynamic Date and Amount</h2>
        <ul>
          {report.dynamicFields.map((field, index) => (
            <li key={index}>
              Date: {field.date}, Amount: {field.amount}
            </li>
          ))}
        </ul>

        <h2>Calculated Fields</h2>
        <p>Total Business: {report.totalBusiness}</p>
        <p>Percentage: {report.percentage}%</p>
        <p>Expected Amount: {report.expectedAmount}</p>
        <p>Status: {report.status}</p>
      </div>
      <div className="actions">
        <Link to={`/main/update-report/${report.id}`} className="update-button">
          Update
        </Link>
        <button onClick={handleDelete} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
}

export default ReportView;