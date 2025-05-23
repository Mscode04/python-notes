import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import './BreifReport.css';

function BreifReport() {
  const [staffYears, setStaffYears] = useState([]);
  const [filteredStaffYears, setFilteredStaffYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPercentageRange, setSelectedPercentageRange] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'headquarters', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffYears = async () => {
      const querySnapshot = await getDocs(collection(db, 'Reports'));
      const reportData = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const key = `${data.staff}_${data.reportOfYear}`;

        if (!reportData[key]) {
          reportData[key] = {
            staff: data.staff,
            year: data.reportOfYear,
            headquarters: data.headquarters || "N/A",
            doctorNames: new Set(),
            percentages: [],
            count: 0,
          };
        }

        if (data.doctorName) {
          reportData[key].doctorNames.add(data.doctorName);
        }

        if (data.percentage) {
          reportData[key].percentages.push(parseFloat(data.percentage));
        }

        reportData[key].count += 1;
      });

      const staffYearList = Object.values(reportData).map((item) => ({
        staff: item.staff,
        year: item.year,
        headquarters: item.headquarters,
        totalDoctors: item.doctorNames.size,
        averagePercentage: (
          item.percentages.reduce((sum, perc) => sum + perc, 0) / item.percentages.length || 0
        ).toFixed(2),
        count: item.count,
      }));

      setStaffYears(staffYearList);
      setFilteredStaffYears(staffYearList);
      setLoading(false);
    };

    fetchStaffYears();
  }, []);

  useEffect(() => {
    let filteredData = staffYears.filter((item) => {
      const matchesSearch = item.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.headquarters.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.year.toString().includes(searchTerm);

      const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;

      const matchesPercentage = selectedPercentageRange === 'all' ||
        (selectedPercentageRange === 'below25' && item.averagePercentage < 25) ||
        (selectedPercentageRange === '25-50' && item.averagePercentage >= 25 && item.averagePercentage <= 50) ||
        (selectedPercentageRange === '50-75' && item.averagePercentage > 50 && item.averagePercentage <= 75) ||
        (selectedPercentageRange === '75-100' && item.averagePercentage > 75 && item.averagePercentage <= 100) ||
        (selectedPercentageRange === 'above100' && item.averagePercentage > 100);

      return matchesSearch && matchesYear && matchesPercentage;
    });

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredStaffYears(filteredData);
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedPercentageRange, sortConfig, staffYears]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaffYears.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaffYears.length / itemsPerPage);

  const getPageNumbers = () => {
    let pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) {
      endPage = Math.min(totalPages, 3);
    } else if (currentPage === totalPages) {
      startPage = Math.max(1, totalPages - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const PaginationControls = () => {
    const pageNumbers = getPageNumbers();

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {pageNumbers.map(number => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return (
    <div className='loading-container'>
      <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="Loading..." />
    </div>
  );

  return (
    <div className="bg-main">
      <div className="staffreport-annual-report-container p-4">
        <button onClick={() => navigate(-1)} className="back-button">
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold mb-4">Brief Reports</h1>

        <h3>Total Reports: {filteredStaffYears.length}</h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Staff, HQ, or Year"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control mb-2"
          />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-control mb-2"
          >
            <option value="all">All Years</option>
            {[...new Set(staffYears.map((item) => item.year))].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedPercentageRange}
            onChange={(e) => setSelectedPercentageRange(e.target.value)}
            className="form-control mb-2"
          >
            <option value="all">All Percentages</option>
            <option value="below25">Below 25%</option>
            <option value="25-50">25% - 50%</option>
            <option value="50-75">50% - 75%</option>
            <option value="75-100">75% - 100%</option>
            <option value="above100">Above 100%</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort('staff')}>Staff Name</th>
                <th onClick={() => handleSort('headquarters')}>HQ</th>
                <th onClick={() => handleSort('year')}>Report Year</th>
                <th onClick={() => handleSort('totalDoctors')}>Total Customer</th>
                <th onClick={() => handleSort('averagePercentage')}>Average Percentage</th>
                <th onClick={() => handleSort('count')}>Number of Reports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                  <td>{item.staff}</td>
                  <td>{item.headquarters}</td>
                  <td>{item.year}</td>
                  <td>{item.totalDoctors}</td>
                  <td>{item.averagePercentage}%</td>
                  <td>{item.count}</td>
                  <td>
                    <Link
                      to={`/main/brief-report/${encodeURIComponent(item.staff)}/${item.year}`}
                      className="btn-sm bg-success p-2 text-light text-decoration-none"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaffYears.length > itemsPerPage && (
          <div className="mt-4">
            <PaginationControls />
          </div>
        )}
      </div>
    </div>
  );
}

export default BreifReport;