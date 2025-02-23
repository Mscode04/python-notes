import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useParams, Link ,useNavigate} from 'react-router-dom';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './StaffYearReports.css';

function StaffYearReports() {
  const { staff, year } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [percentageFilter, setPercentageFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
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

  const formatDate = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const exportAllToExcel = () => {
    // Generate all months in order (Jan-Dec)
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(reports[0].reportOfYear, i);
      return date.toLocaleString("en-US", { month: "short" }) + "-" + reports[0].reportOfYear;
    });
    
    // Create the worksheet data with ordered dynamic fields
    const worksheetData = reports.map((report) => {
      // Create monthly sales data
      const monthlySales = {};
      allMonths.forEach(month => {
        const found = report.dynamicFields?.find(field => {
          const fieldDate = new Date(field.date);
          return (
            fieldDate.toLocaleString("en-US", { month: "short" }) + "-" + fieldDate.getFullYear() === month
          );
        });
        monthlySales[month] = found ? `${found.amount}` : "N/A";
      });
  
      return {
        "Report Year": report.reportOfYear,
        "Staff": report.staff,
        "HQ": report.headquarters,
        "Customer Name": report.doctorName,
        "Area": report.area,
        "Activity Month": report.activityMonth,
        "Activity Amount": report.activityAmount,
        ...(report.targetedProducts && { "Products": report.targetedProducts.join(", ") }),
        "Targeted Times": report.targetedTimes,
        "Last Year Amount": report.lastYearAmount,
        ...monthlySales, // Monthly sales as columns (Jan-Dec)
        "Total Business": report.totalBusiness,
        "Percentage": `${Math.round(report.percentage * 100) / 100}%`,
        "Expected Amount": report.expectedAmount,
        "Status": report.status,
      };
    });
  
    // Create the worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
  
    // Style headers
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "283593" } }, // Dark blue background
        font: { color: { rgb: "FFFFFF" }, bold: true }, // White text, bold
      };
    }
  
    // Auto-format columns
    const colWidths = Object.keys(worksheetData[0]).map(key => ({ wch: key.length + 10 })); // Increased width
    worksheet["!cols"] = colWidths;
  
    XLSX.writeFile(workbook, `All_Reports.xlsx`);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Very Good':
        return '#90EE90';
      case 'Good':
        return '#32CD32';
      case 'Bad':
        return '#FFA500';
      case 'Very Bad':
        return '#FF0000';
      default:
        return '#0000FF';
    }
  };

  const filterReports = (reports) => {
    switch (percentageFilter) {
      case 'below25':
        return reports.filter(report => report.percentage < 25);
      case '25-50':
        return reports.filter(report => report.percentage >= 25 && report.percentage < 50);
      case '50-75':
        return reports.filter(report => report.percentage >= 50 && report.percentage < 75);
      case '75-100':
        return reports.filter(report => report.percentage >= 75 && report.percentage <= 100);
      case 'above100':
        return reports.filter(report => report.percentage > 100);
      default:
        return reports;
    }
  };

  const sortReports = (reports) => {
    return reports.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.percentage - b.percentage;
      } else {
        return b.percentage - a.percentage;
      }
    });
  };

  const filteredReports = filterReports(reports);
  const sortedReports = sortReports(filteredReports);

  if (loading) return <div className='loading-container'>
    <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="" />
  </div>;

  return (
    <div className="reports-container">
  <button onClick={() => navigate(-1)} className="back-button" style={{ color: "#d6e8ee" }}>
    <i className="bi bi-arrow-left"></i>
  </button>
  <h2>Reports for {decodeURIComponent(staff)} - {year}</h2>
  <div className="filters-container">
    <label>
      <select value={percentageFilter} onChange={(e) => setPercentageFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="below25">Below 25%</option>
        <option value="25-50">25% - 50%</option>
        <option value="50-75">50% - 75%</option>
        <option value="75-100">75% - 100%</option>
        <option value="above100">Above 100%</option>
      </select>
    </label>

    <label>
      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </label>
  </div>

  <table className="reports-table">
    <thead>
      <tr>
        <th>Customer Name</th>
        <th>Area</th>
        <th>Headquarters</th>
        <th>Activity Month</th>
        <th>Activity Amount</th>
        <th>Target Times</th>
        <th>Last Year Collection</th>
        {/* Dynamically generate monthly columns (Jan-X to Dec-X) */}
        {Array.from({ length: 12 }, (_, i) => {
          const date = new Date(year, i);
          const monthYear = date.toLocaleString("en-US", { month: "short" }) + "-" + year;
          return <th key={i}>{monthYear}</th>;
        })}
        <th>Total Business</th>
        <th>Expected Amount</th>
        <th>Percentage</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {sortedReports.map((report) => {
        // Generate monthly sales data for the current report
        const monthlySales = {};
        Array.from({ length: 12 }, (_, i) => {
          const date = new Date(year, i);
          const monthYear = date.toLocaleString("en-US", { month: "short" }) + "-" + year;
          const found = report.dynamicFields?.find((field) => {
            const fieldDate = new Date(field.date);
            return (
              fieldDate.toLocaleString("en-US", { month: "short" }) + "-" + fieldDate.getFullYear() === monthYear
            );
          });
          monthlySales[monthYear] = found ? found.amount : "N/A";
        });

        return (
          <tr key={report.id}>
            <td>{report.doctorName}</td>
            <td>{report.area}</td>
            <td>{report.headquarters}</td>
            <td>{report.activityMonth}</td>
            <td>{report.activityAmount}</td>
            <td>{report.targetedTimes}</td>
            <td>{report.lastYearAmount}</td>
            {/* Render monthly sales data */}
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(year, i);
              const monthYear = date.toLocaleString("en-US", { month: "short" }) + "-" + year;
              return <td key={i}>{monthlySales[monthYear]}</td>;
            })}
            <td>{report.totalBusiness}</td>
            <td>{report.expectedAmount}</td>
            <td>{Math.round(report.percentage * 100) / 100}%</td>
            <td>
              <button
                className="status-button"
                style={{ backgroundColor: getStatusColor(report.status) }}
                title={report.status}
              ></button>
            </td>
            <td>
              <Link to={`/main/update-report/${report.id}`} className="export-btn">
                Update
              </Link>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
  <div className="download-buttons">
    <button onClick={exportAllToExcel} className="export-btn">
      Download All as Excel
    </button>
  </div>
</div>
  );
}

export default StaffYearReports;