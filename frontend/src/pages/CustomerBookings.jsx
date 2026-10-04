import React, { useState, useEffect } from 'react';
import { getBookingsApi, cancelBookingApi } from '../services/api';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookingsApi();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await cancelBookingApi(id);
      setActionMessage('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      <div className="panel">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Bookings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          View and manage your vehicle reservations.
        </p>
      </div>

      {actionMessage && (
        <div className="alert alert-success">
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>You have no active vehicle bookings.</p>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle Model</th>
                  <th>Type & Registration</th>
                  <th>Pickup Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking.vehicle?.model || 'N/A'}</strong>
                    </td>
                    <td>
                      {booking.vehicle?.type} ({booking.vehicle?.vehicleNumber})
                    </td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td>
                      {booking.status === 'confirmed' ? (
                        <span className="badge badge-success">Confirmed</span>
                      ) : (
                        <span className="badge badge-danger">Cancelled</span>
                      )}
                    </td>
                    <td>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
