import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVehicleByIdApi, createBookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await getVehicleByIdApi(id);
        setVehicle(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Both pickup and return dates are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setBookingError('Start date must not be after or equal to return date.');
      return;
    }

    setSubmitting(true);

    try {
      await createBookingApi({
        vehicleId: id,
        startDate,
        endDate,
      });

      setBookingSuccess('Booking confirmed successfully!');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      // Backend error response (e.g., date overlap rejection)
      setBookingError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalCost = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    if (diffTime <= 0) return 0;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days * (vehicle?.pricePerDay || 0);
  };

  const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  if (loading) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading vehicle details...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
          <h2>{error || 'Vehicle Not Found'}</h2>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>
            ← Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '16px' }}>
        ← Back to Vehicles
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Vehicle Details Panel */}
        <div className="panel">
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{vehicle.model}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Registration: {vehicle.vehicleNumber}</p>

          <table className="table" style={{ marginBottom: '16px' }}>
            <tbody>
              <tr>
                <th>Vehicle Type</th>
                <td>{vehicle.type}</td>
              </tr>
              <tr>
                <th>Price / Day</th>
                <td><strong>₹{vehicle.pricePerDay}</strong></td>
              </tr>
              <tr>
                <th>Registration Number</th>
                <td>{vehicle.vehicleNumber}</td>
              </tr>
              <tr>
                <th>Document Status</th>
                <td>
                  {vehicle.documentPath ? (
                    <a 
                      href={`${getBackendUrl()}${vehicle.documentPath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="badge badge-success"
                      style={{ textDecoration: 'none' }}
                    >
                      View Verified Document
                    </a>
                  ) : (
                    <span className="badge badge-warning">No Document Uploaded</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Booking Form Panel */}
        <div className="panel">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Book Vehicle</h2>

          {bookingError && (
            <div className="alert alert-error">
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="alert alert-success">
              <span>{bookingSuccess}</span>
            </div>
          )}

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Pickup Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Return Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {startDate && endDate && calculateTotalCost() > 0 && (
              <div 
                style={{
                  background: '#f1f5f9',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Total Amount:</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  ₹{calculateTotalCost()}
                </strong>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : isAuthenticated ? 'Confirm Booking' : 'Login to Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
