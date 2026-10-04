import React, { useState, useEffect } from 'react';
import { getVehiclesApi, createVehicleApi, updateVehicleApi, deleteVehicleApi, getBookingsApi } from '../services/api';

const AdminFleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form Fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Car');
  const [pricePerDay, setPricePerDay] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        getVehiclesApi(),
        getBookingsApi()
      ]);
      setVehicles(vRes.data.vehicles || []);
      setBookings(bRes.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setVehicleNumber('');
    setModel('');
    setType('Car');
    setPricePerDay('');
    setDocumentFile(null);
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setVehicleNumber(v.vehicleNumber);
    setModel(v.model);
    setType(v.type);
    setPricePerDay(v.pricePerDay);
    setDocumentFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('vehicleNumber', vehicleNumber);
    formData.append('model', model);
    formData.append('type', type);
    formData.append('pricePerDay', pricePerDay);
    if (documentFile) {
      formData.append('document', documentFile);
    }

    try {
      if (editingVehicle) {
        await updateVehicleApi(editingVehicle._id, formData);
        setSuccess('Vehicle updated successfully!');
      } else {
        await createVehicleApi(formData);
        setSuccess('Vehicle added successfully!');
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicleApi(id);
      setSuccess('Vehicle deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  return (
    <div className="container">
      {/* Admin Panel Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage vehicle fleet inventory, documents, and view customer bookings.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          + Add New Vehicle
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Fleet Inventory Table */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Vehicle Fleet</h2>
      
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading fleet...</div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '30px' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Registration No.</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Price / Day</th>
                  <th>Document</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td><strong>{v.vehicleNumber}</strong></td>
                    <td>{v.model}</td>
                    <td><span className="badge badge-info">{v.type}</span></td>
                    <td>₹{v.pricePerDay}</td>
                    <td>
                      {v.documentPath ? (
                        <a 
                          href={`${getBackendUrl()}${v.documentPath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-success"
                          style={{ textDecoration: 'none' }}
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="badge badge-warning">No Doc</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openEditModal(v)} className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Bookings Overview */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>All Customer Bookings ({bookings.length})</h2>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Vehicle Model & Reg</th>
                <th>Booking Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.customer?.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customer?.email}</div>
                  </td>
                  <td>{b.vehicle?.model} ({b.vehicle?.vehicleNumber})</td>
                  <td>
                    {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td>
                    {b.status === 'confirmed' ? (
                      <span className="badge badge-success">Confirmed</span>
                    ) : (
                      <span className="badge badge-danger">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Vehicle */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MH-02-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Model</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Toyota Fortuner"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SUV, Sedan, Car"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price Per Day (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2500"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Upload Document (Multer)</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                />
                {editingVehicle?.documentPath && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Current document: {editingVehicle.documentPath}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFleet;
