// StaffYearReports.js (Detailed Reports Component)
import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './AnnualReport.css';

function StaffYearReports() {
  const { staff, year } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(
        collection(db, 'Reports'),
        where('staff', '==', decodeURIComponent(staff)),
        where('reportOfYear', '==', year)
      );

      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReports(reportsData);
      setLoading(false);
    };

    fetchReports();
  }, [staff, year]);

  if (loading) return <div className='loading-container'>
  <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="" />
</div>;

  return (
    <div className="reports-container">
      <h2>Reports for {decodeURIComponent(staff)} - {year}</h2>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Address</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Total Business</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.doctorName}</td>
              <td>{report.address}</td>
              <td>{report.activityMonth}</td>
              <td>{report.activityAmount}</td>
              <td>{report.status}</td>
              <td>{report.totalBusiness}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StaffYearReports;