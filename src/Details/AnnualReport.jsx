// AnnualReport.js (Main Component)
import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './AnnualReport.css';

function AnnualReport() {
  const [staffYears, setStaffYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffYears = async () => {
      const querySnapshot = await getDocs(collection(db, 'Reports'));
      const uniqueCombinations = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const key = `${data.staff}_${data.reportOfYear}`;
        uniqueCombinations.add(key);
      });

      const staffYearList = Array.from(uniqueCombinations).map((key) => {
        const [staff, year] = key.split('_');
        return { staff, year };
      });

      setStaffYears(staffYearList);
      setLoading(false);
    };

    fetchStaffYears();
  }, []);

  if (loading) return <div className='loading-container'>
    <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="" />
  </div>;

  return (
    <div className="staffreport-annual-report-container">
      <h1>Staff Reports</h1>
      <div className="staffreport-staff-year-list">
        {staffYears.map((item, index) => (
          <Link 
            key={index}
            to={`/main/annual-report/${encodeURIComponent(item.staff)}/${item.year}`}
            className="staffreport-staff-year-card"
          >
            <h3>{item.staff}</h3>
            <p>Year: {item.year}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AnnualReport;
