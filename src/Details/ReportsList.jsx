import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../Firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReportList.css';

function ReportList() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    headquarters: '',
    area: '',
    staff: '',
    status: '',
    reportOfYear: '',
  });
  const [sortConfig, setSortConfig] = useState({ 
    key: 'staff', 
    secondaryKey: 'reportOfYear',
    direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filters, reports, sortConfig]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'Reports'));
      const reportsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsList);
      setFilteredReports(reportsList);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const pin = prompt('Enter PIN to confirm deletion:');
    if (pin === '2024') {
      await deleteDoc(doc(db, 'Reports', id));
      toast.success('Report deleted successfully');
      fetchReports();
    } else {
      toast.error('Incorrect PIN. Deletion canceled.');
    }
  };

  const applyFilters = () => {
    let filtered = reports.filter((report) => 
      report.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      report.staff.toLowerCase().includes(search.toLowerCase()) ||
      report.headquarters.toLowerCase().includes(search.toLowerCase()) ||
      report.area.toLowerCase().includes(search.toLowerCase())
    );

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((report) => report[key] === filters[key]);
      }
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Primary sort
        let compare = String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]));
        
        // Secondary sort if primary is equal
        if (compare === 0 && sortConfig.secondaryKey) {
          compare = String(a[sortConfig.secondaryKey]).localeCompare(String(b[sortConfig.secondaryKey]));
        }

        return sortConfig.direction === 'asc' ? compare : -compare;
      });
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      secondaryKey: key === 'staff' ? 'reportOfYear' : prev.secondaryKey,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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

  return (
    <div className="getyt">
      <div className="allreport-container">
        <button onClick={() => navigate(-1)} className="back-button"><i className="bi bi-arrow-left"></i></button>
        <ToastContainer position="top-center" autoClose={2000} />
        <h1>Single Reports</h1>
        <h2 className='text-dark'>Total Reports: {filteredReports.length}</h2>

        {/* Search and Filters */}
        <div className="search-filter-container">
          <input 
            type="text" 
            placeholder="Search " 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="search-input mt-4"
          />

          <select onChange={(e) => setFilters({ ...filters, headquarters: e.target.value })}>
            <option value="">Filter by HQ</option>
            {[...new Set(reports.map(r => r.headquarters))].map(hq => (
              <option key={hq} value={hq}>{hq}</option>
            ))}
          </select>

          <select onChange={(e) => setFilters({ ...filters, area: e.target.value })}>
            <option value="">Filter by Area</option>
            {[...new Set(reports.map(r => r.area))].map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select onChange={(e) => setFilters({ ...filters, staff: e.target.value })}>
            <option value="">Filter by Staff</option>
            {[...new Set(reports.map(r => r.staff))].map(staff => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
          </select>

          <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Filter by Status</option>
            {[...new Set(reports.map(r => r.status))].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select onChange={(e) => setFilters({ ...filters, reportOfYear: e.target.value })}>
            <option value="">Filter by Year</option>
            {[...new Set(reports.map(r => r.reportOfYear).filter(year => year))].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="Loading..." />
          </div>
        ) : (
          <>
            <table className="allreport-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => handleSort('doctorName')}>Customer Name</th>
                  <th onClick={() => handleSort('staff')}>Staff Name</th>
                  <th onClick={() => handleSort('reportOfYear')}>Report Year</th>
                  <th onClick={() => handleSort('totalBusiness')}>Total Business</th>
                  <th onClick={() => handleSort('status')}>Status</th>
                  <th onClick={() => handleSort('headquarters')}>HQ</th>
                  <th onClick={() => handleSort('area')}>Area</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((report, index) => (
                  <tr key={report.id} className="allreport-row">
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{report.doctorName}</td>
                    <td>{report.staff}</td>
                    <td>{report.reportOfYear}</td>
                    <td>{report.totalBusiness}</td>
                    <td>{report.status}</td>
                    <td>{report.headquarters}</td>
                    <td>{report.area}</td>
                    <td>
                      <Link to={`/main/si-report/${report.id}`} className="allreport-view-button">View</Link>
                      <button onClick={() => handleDelete(report.id)} className="allreport-delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length > itemsPerPage && (
              <div className="mt-4">
                <PaginationControls />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReportList;