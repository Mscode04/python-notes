import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from "../Firebase/config";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Create.css'; // Import CSS for styling

function UpdateReport() {
  const { id } = useParams();

  // Section 0: General Details
  const [reportOfYear, setReportOfYear] = useState('');
  const navigate=useNavigate()
  // Section 1: Doctor Details
  const [doctorName, setDoctorName] = useState(null);

  const [area, setArea] = useState(null);
  const [headquarters, setHeadquarters] = useState(null);
  const [staff, setStaff] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [headquartersList, setHeadquartersList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Section 2: Activity Details
  const [activityMonth, setActivityMonth] = useState('');
 
  const [activityAmount, setActivityAmount] = useState('');
 
  const [targetedTimes, setTargetedTimes] = useState('');



  // Section 4: Targeted Products
  const [targetedProducts, setTargetedProducts] = useState([{ productName: '' }]);

  // Section 5: Last Year Amount
  const [lastYearAmount, setLastYearAmount] = useState('');

  // Section 6: Dynamic Date and Amount
  const [dynamicFields, setDynamicFields] = useState([{ date: '', amount: '' }]);

  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    fetchReport();
    fetchDoctors();
    fetchAreas();
    fetchHeadquarters();
    fetchProducts();
  }, [id]);

  const fetchReport = async () => {
    const docRef = doc(db, "Reports", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const reportData = docSnap.data();
      setReportOfYear(reportData.reportOfYear);
      setDoctorName({ value: reportData.doctorName, label: reportData.doctorName });
   
      setArea(reportData.area ? { value: reportData.area, label: reportData.area } : null);
      setHeadquarters(reportData.headquarters ? { value: reportData.headquarters, label: reportData.headquarters } : null);
      setStaff(reportData.staff ? { value: reportData.staff, label: reportData.staff } : null);
      setActivityMonth(reportData.activityMonth);
      
      setActivityAmount(reportData.activityAmount);

      setTargetedTimes(reportData.targetedTimes);
      
      setTargetedProducts(reportData.targetedProducts.map(product => ({ productName: product })));
      setLastYearAmount(reportData.lastYearAmount);
      setDynamicFields(reportData.dynamicFields);
    } else {
      toast.error("No such document!");
    }
  };

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "Products"));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductsList(products.map(product => ({ value: product.id, label: product.productName, ...product })));
  };

  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, "Doctors"));
    const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoctorsList(doctors.map(doctor => ({ value: doctor.id, label: doctor.name, ...doctor })));
  };

  const fetchAreas = async () => {
    const querySnapshot = await getDocs(collection(db, "Areas"));
    const areas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAreasList(areas.map(area => ({ value: area.id, label: area.name })));
  };

  const fetchHeadquarters = async () => {
    const querySnapshot = await getDocs(collection(db, "Headquarters"));
    const headquarters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHeadquartersList(headquarters.map(hq => ({ value: hq.id, label: hq.place, ...hq })));
  };

  const handleDoctorChange = (selectedOption) => {
    setDoctorName(selectedOption);
    const selectedDoctor = doctorsList.find(doctor => doctor.value === selectedOption.value);
    if (selectedDoctor) {
    
      setArea(selectedDoctor.area ? { value: selectedDoctor.area, label: selectedDoctor.area } : null);
      setHeadquarters(selectedDoctor.headquarters ? { value: selectedDoctor.headquarters, label: selectedDoctor.headquarters } : null);
      setStaff(selectedDoctor.staff ? { value: selectedDoctor.staff, label: selectedDoctor.staff } : null);
    }
  };



  const handleTargetedProductChange = (selectedOption, index) => {
    const newProducts = [...targetedProducts];
    newProducts[index].productName = selectedOption ? selectedOption.label : '';
    setTargetedProducts(newProducts);
  };

  const handleHeadquartersChange = (selectedOption) => {
    setHeadquarters(selectedOption);
    const selectedHeadquarter = headquartersList.find(hq => hq.value === selectedOption.value);
    if (selectedHeadquarter && selectedHeadquarter.staff) {
      setStaffList(selectedHeadquarter.staff.map(staff => ({ value: staff.name, label: staff.name, ...staff })));
    } else {
      setStaffList([]);
    }
  };



  const handleAddTargetedProduct = () => {
    setTargetedProducts([...targetedProducts, { productName: '' }]);
  };

  const handleAddDynamicField = () => {
    setDynamicFields([...dynamicFields, { date: '', amount: '' }]);
  };

 

  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const reportData = {
        reportOfYear,
        doctorName: doctorName.label,
        area: area ? area.label : null,
        headquarters: headquarters ? headquarters.label : null,
        staff: staff ? staff.label : null,
        activityMonth,
        activityAmount,
        targetedTimes,
        targetedProducts: targetedProducts.map(product => product.productName),
        lastYearAmount,
        dynamicFields,
        totalBusiness,
        percentage,
        expectedAmount,
        status: statusColor === 'very-bad' ? 'Very Bad' :
                statusColor === 'bad' ? 'Bad' :
                statusColor === 'good' ? 'Good' :
                statusColor === 'very-good' ? 'Very Good' :
                '[TOPUP][CLOSED]'
      };
  
      await updateDoc(doc(db, "Reports", id), reportData);
      toast.success(`Report updated successfully`);
  
      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Failed to update report. Please try again.");
    }
  };
  

  // Calculate Total Business
  const totalBusiness = parseFloat(lastYearAmount || 0) + dynamicFields.reduce((sum, field) => sum + parseFloat(field.amount || 0), 0);
  // Calculate Expected Amount
  const expectedAmount = parseFloat(activityAmount || 0) * parseFloat(targetedTimes || 0);
  // Calculate Percentage
  const percentage = totalBusiness === 0 ? 0 : (parseFloat(totalBusiness || 0) / expectedAmount) * 100;

  // Determine Status
  const getStatusColor = () => {
    if (percentage > 100) return '[TOPUP][CLOSED]'; // Above 100%
    if (percentage >= 75) return 'very-good'; // 75-100%
    if (percentage >= 50) return 'good'; // 50-75%
    if (percentage >= 25) return 'bad'; // 25-50%
    return 'very-bad'; // Below 25%
  };

  const statusColor = getStatusColor();

  return (
    <div className="cretemain">
       <button className="adminreg-back-button" style={{ color: "#d6e8ee", backgroundColor: "transparent", border: "none" }} onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
    <div className="create-report-container">
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

      <h1 className="create-report-title">Update Report</h1>

      <form onSubmit={handleSubmit}>
        {/* Section 0: General Details */}
        <div className="section">
          <h2>General Details</h2>
          <div className="form-group">
            <label>Report of Year:</label>
            <input
              type="text"
              value={reportOfYear}
              onChange={(e) => setReportOfYear(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 1: Doctor Details */}
        <div className="section">
          <h2>Customer Details</h2>
          <div className="form-group">
            <label>Customer Name:</label>
            <Select
              value={doctorName}
              onChange={handleDoctorChange}
              options={doctorsList}
              placeholder="Select Doctor"
              isSearchable
            />
          </div>
    
          <div className="form-group">
            <label>Area:</label>
            <Select
              value={area}
              onChange={(selectedOption) => setArea(selectedOption)}
              options={areasList}
              placeholder="Select Area"
              isSearchable
            />
          </div>
          <div className="form-group">
            <label>Headquarters:</label>
            <Select
              value={headquarters}
              onChange={handleHeadquartersChange}
              options={headquartersList}
              placeholder="Select Headquarters"
              isSearchable
            />
          </div>
          <div className="form-group">
            <label>Staff:</label>
            <Select
              value={staff}
              onChange={(selectedOption) => setStaff(selectedOption)}
              options={staffList}
              placeholder="Select Staff"
              isSearchable
            />
          </div>
        </div>

        {/* Section 2: Activity Details */}
        <div className="section">
          <h2>Activity Details</h2>
          <div className="form-group">
            <label>Month:</label>
            <input
              type="month"
              value={activityMonth}
              onChange={(e) => setActivityMonth(e.target.value)}
              required
            />
          </div>
  
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={activityAmount}
              onChange={(e) => setActivityAmount(e.target.value)}
              required
            />
          </div>
         
     
          <div className="form-group">
            <label>Targeted Times:</label>
            <input
              type="number"
              value={targetedTimes}
              onChange={(e) => setTargetedTimes(e.target.value)}
              required
            />
          </div>
        </div>

   

        {/* Section 4: Targeted Products */}
        <div className="section">
          <h2>Products</h2>
          {targetedProducts.map((product, index) => (
            <div key={index} className="form-group">
              <label>Product Name:</label>
              <Select
                value={productsList.find(option => option.label === product.productName)}
                onChange={(selectedOption) => handleTargetedProductChange(selectedOption, index)}
                options={productsList}
                placeholder="Select Product"
                isSearchable
              />
            </div>
          ))}
          <button type="button" onClick={handleAddTargetedProduct}>Add More</button>
        </div>

        {/* Section 5: Last Year Amount */}
        <div className="section">
          <h2>Last Year Amount</h2>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={lastYearAmount}
              onChange={(e) => setLastYearAmount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 6: Dynamic Date and Amount */}
        <div className="section">
          <h2>Dynamic Date and Amount</h2>
          {dynamicFields.map((field, index) => (
            <div key={index} className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={field.date}
                onChange={(e) => {
                  const newFields = [...dynamicFields];
                  newFields[index].date = e.target.value;
                  setDynamicFields(newFields);
                }}
                required
              />
              <label>Amount:</label>
              <input
                type="number"
                value={field.amount}
                onChange={(e) => {
                  const newFields = [...dynamicFields];
                  newFields[index].amount = e.target.value;
                  setDynamicFields(newFields);
                }}
                required
              />
            </div>
          ))}
          <button type="button" onClick={handleAddDynamicField}>Add More</button>
        </div>

        {/* Section 7: Total Business */}
        <div className="section">
          <h2>Total Business</h2>
          <div className="form-group">
            <label>Total Business:</label>
            <input
              type="text"
              value={totalBusiness}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Percentage:</label>
            <input
              type="text"
              value={`${percentage}%`}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Expected Amount:</label>
            <input
              type="text"
              value={expectedAmount}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor:
                  statusColor === 'very-bad' ? 'red' :
                  statusColor === 'bad' ? 'orange' :
                  statusColor === 'good' ? 'yellow' :
                  statusColor === 'very-good' ? 'green' :
                  'blue', // For reload
                marginRight: '8px'
              }} />
              <span>
                {statusColor === 'very-bad' ? 'Very Bad' :
                 statusColor === 'bad' ? 'Bad' :
                 statusColor === 'good' ? 'Good' :
                 statusColor === 'very-good' ? 'Very Good' :
                 '[TOPUP][CLOSED]'}
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">Update</button>
      </form>
    </div>
    </div>
  );
}

export default UpdateReport;