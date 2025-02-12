import React, { useState, useEffect } from 'react';
import { db } from "../Firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './Area.css';

function Area() {
  const [name, setName] = useState('');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArea, setEditingArea] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "Areas"));
    const areasList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAreas(areasList);
    setLoading(false);
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "Area"), { name });
      toast.success('Area added successfully!');
      setName('');
      fetchAreas();
    } catch (error) {
      toast.error('Error adding area. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (id) => {
    try {
      await deleteDoc(doc(db, "Area", id));
      toast.success('Area deleted successfully!');
      fetchAreas();
    } catch (error) {
      toast.error('Error deleting area. Please try again.');
    }
  };

  const handleUpdateArea = async () => {
    try {
      await updateDoc(doc(db, "Area", editingArea.id), { name: editingArea.name });
      toast.success('Area updated successfully!');
      setEditingArea(null);
      fetchAreas();
    } catch (error) {
      toast.error('Error updating area. Please try again.');
    }
  };

  const filteredAreas = areas.filter(area => area.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="area-container">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h1>Area Management</h1>
      
      <form onSubmit={handleAddArea} className="area-form">
        <input
          type="text"
          placeholder="Enter Area Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Area'}</button>
      </form>
      
      <input
        type="text"
        placeholder="Search areas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      
      <table className="area-table">
        <thead>
          <tr>
            <th>Area Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAreas.map(area => (
            <tr key={area.id}>
              <td>
                {editingArea?.id === area.id ? (
                  <input
                    type="text"
                    value={editingArea.name}
                    onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                  />
                ) : (
                  area.name
                )}
              </td>
              <td>
                {editingArea?.id === area.id ? (
                  <>
                    <button onClick={handleUpdateArea}>Save</button>
                    <button onClick={() => setEditingArea(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingArea(area)}>Update</button>
                    <button onClick={() => handleDeleteArea(area.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Area;
