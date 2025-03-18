import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import './DoctorList.css'; // Add your custom styles for the table and modal

Modal.setAppElement('#root'); // Required for accessibility

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [confirmationPin, setConfirmationPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    staff: '',
    area: '',
    headquarters: '',
  });
  const [sortBy, setSortBy] = useState('staff');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30); // Number of items per page
  const [uniqueStaff, setUniqueStaff] = useState([]);
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [uniqueHeadquarters, setUniqueHeadquarters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      extractUniqueFilters();
      applyFiltersAndSort();
    }
  }, [doctors, searchTerm, filters, sortBy]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'Doctors'));
      const doctorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors: ', error);
      toast.error('Error fetching Customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractUniqueFilters = () => {
    const staffSet = new Set();
    const areaSet = new Set();
    const headquartersSet = new Set();

    doctors.forEach((doctor) => {
      if (doctor.staff) staffSet.add(doctor.staff);
      if (doctor.area) areaSet.add(doctor.area);
      if (doctor.headquarters) headquartersSet.add(doctor.headquarters);
    });

    setUniqueStaff([...staffSet].sort());
    setUniqueAreas([...areaSet].sort());
    setUniqueHeadquarters([...headquartersSet].sort());
  };

  const handleDelete = async () => {
    if (confirmationPin === '2024') {
      try {
        await deleteDoc(doc(db, 'Doctors', selectedDoctorId));
        toast.success('Customer deleted successfully!');
        fetchDoctors(); // Refresh the list after deletion
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting doctor: ', error);
        toast.error('Error deleting Customer. Please try again.');
      }
    } else {
      toast.error('Incorrect PIN. Please try again.');
    }
  };

  const openDeleteModal = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setConfirmationPin('');
    setSelectedDoctorId(null);
  };

  const applyFiltersAndSort = () => {
    let filtered = doctors.filter((doctor) => {
      return (
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filters.staff ? doctor.staff === filters.staff : true) &&
        (filters.area ? doctor.area === filters.area : true) &&
        (filters.headquarters ? doctor.headquarters === filters.headquarters : true)
      );
    });

    // Sort by selected field
    filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });

    setFilteredDoctors(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="doctor-list-container">
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

      <button onClick={() => navigate(-1)} className="back-button" style={{ color: '#d6e8ee' }}>
        <i className="bi bi-arrow-left"></i>
      </button>
      <h1 className="doctor-list-title">Customer List</h1>
      <Link to="/main/doctor" className="add-doctor-link">
        Add New Customer
      </Link>

      {/* Search and Filters */}
      <div className="doclist-search-filters">
  <input
    type="text"
    placeholder="Search by name..."
    value={searchTerm}
    onChange={handleSearchChange}
    className="doclist-search-input"
  />
  <select
    name="staff"
    value={filters.staff}
    onChange={handleFilterChange}
    className="doclist-filter-select"
  >
    <option value="">All Staff</option>
    {uniqueStaff.map((staff, index) => (
      <option key={index} value={staff}>
        {staff}
      </option>
    ))}
  </select>
  <select
    name="area"
    value={filters.area}
    onChange={handleFilterChange}
    className="doclist-filter-select"
  >
    <option value="">All Areas</option>
    {uniqueAreas.map((area, index) => (
      <option key={index} value={area}>
        {area}
      </option>
    ))}
  </select>
  <select
    name="headquarters"
    value={filters.headquarters}
    onChange={handleFilterChange}
    className="doclist-filter-select"
  >
    <option value="">All Headquarters</option>
    {uniqueHeadquarters.map((hq, index) => (
      <option key={index} value={hq}>
        {hq}
      </option>
    ))}
  </select>
  <select
    value={sortBy}
    onChange={handleSortChange}
    className="doclist-sort-select"
  >
    <option value="staff">Sort by Staff</option>
    <option value="name">Sort by Name</option>
    <option value="area">Sort by Area</option>
    <option value="headquarters">Sort by Headquarters</option>
  </select>
</div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className='text-white'>Total Customers: {filteredDoctors.length}</p>
          <table className="doctor-table">
            <thead>
              <tr className="first-main">
                <th>S.No</th>
                <th className="first-hd">Customer Name</th>
                <th>Staff</th>
                <th>Area</th>
                <th>Headquarters</th>
                <th className="first-hd-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((doctor, index) => (
                <tr key={doctor.id} className="docter-list-last">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td className="name-last-docter">{doctor.name}</td>
                  <td>{doctor.staff}</td>
                  <td>{doctor.area}</td>
                  <td>{doctor.headquarters}</td>
                  <td className="action-last">
                    <Link to={`/main/update-doctor/${doctor.id}`} className="update-button">
                      Update
                    </Link>
                    <button className="delete-button" onClick={() => openDeleteModal(doctor.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredDoctors.length / itemsPerPage) }, (_, i) => (
              <button key={i + 1} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation Modal"
        className="delete-modal"
        overlayClassName="delete-modal-overlay"
      >
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this Customer? Enter the confirmation PIN to proceed.</p>
        <input
          type="password"
          placeholder="Enter PIN"
          value={confirmationPin}
          onChange={(e) => setConfirmationPin(e.target.value)}
          className="pin-input"
        />
        <div className="modal-buttons">
          <button onClick={handleDelete} className="confirm-delete-button">
            Confirm Delete
          </button>
          <button onClick={closeDeleteModal} className="cancel-delete-button">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DoctorList;