import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVehiclesApi } from '../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date availability filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await getVehiclesApi(params);
      setVehicles(response.data.vehicles || []);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [startDate, endDate]);

  const filteredVehicles = vehicles.filter((v) => {
    return (
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const getVehicleImage = (vehicle) => {
    if (vehicle.documentPath) {
      const pathLower = vehicle.documentPath.toLowerCase();
      if (pathLower.endsWith('.jpg') || pathLower.endsWith('.jpeg') || pathLower.endsWith('.png')) {
        return `${getBackendUrl()}${vehicle.documentPath}`;
      }
    }
    const typeStr = (vehicle.type || '').toLowerCase();
    const modelStr = (vehicle.model || '').toLowerCase();

    if (typeStr.includes('electric') || typeStr.includes('ev') || modelStr.includes('tesla') || modelStr.includes('bmw')) {
      return '/assets/cars/electric.jpg';
    }
    if (typeStr.includes('suv') || modelStr.includes('fortuner')) {
      return '/assets/cars/suv.jpg';
    }
    return '/assets/cars/sedan.jpg';
  };

  return (
    <div className="container">
      {/* Simple Search & Date Availability Filter Panel */}
      <div className="panel">
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Search Available Vehicles</h2>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Pickup Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Return Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Search Vehicle</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search model or reg number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Available Vehicles Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Available Vehicles ({filteredVehicles.length})</h2>
        {startDate && endDate && (
          <span className="badge badge-info">
            Checking dates: {startDate} to {endDate}
          </span>
        )}
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading vehicles...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>No vehicles found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="card-vehicle">
              {/* 1. Vehicle Image */}
              <img 
                src={getVehicleImage(vehicle)} 
                alt={vehicle.model} 
                className="card-vehicle-img" 
              />

              <div className="card-vehicle-body">
                <div>
                  {/* 2. Vehicle Number */}
                  <div className="card-vehicle-number">
                    {vehicle.vehicleNumber}
                  </div>

                  {/* 3. Model */}
                  <h3 className="card-vehicle-title" style={{ margin: '4px 0' }}>
                    {vehicle.model}
                  </h3>

                  {/* 4. Type */}
                  <div className="card-vehicle-type" style={{ marginBottom: '8px' }}>
                    Type: {vehicle.type}
                  </div>

                  {/* 5. Price / Day */}
                  <div className="card-vehicle-price" style={{ marginBottom: '10px' }}>
                    ₹{vehicle.pricePerDay} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ day</span>
                  </div>

                  {/* Availability Badge */}
                  {vehicle.isAvailable !== undefined && (
                    <div style={{ marginBottom: '8px' }}>
                      {vehicle.isAvailable ? (
                        <span className="badge badge-success">Available for dates</span>
                      ) : (
                        <span className="badge badge-danger">Booked for selected dates</span>
                      )}
                    </div>
                  )}

                  {/* 6. Document Status */}
                  <div>
                    {vehicle.documentPath ? (
                      <a
                        href={`${getBackendUrl()}${vehicle.documentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge badge-success"
                        style={{ textDecoration: 'none' }}
                      >
                        Document Verified
                      </a>
                    ) : (
                      <span className="badge badge-warning">
                        No Document
                      </span>
                    )}
                  </div>
                </div>

                {/* 7. View Details / Book Now */}
                <div style={{ marginTop: '12px' }}>
                  <Link 
                    to={`/vehicles/${vehicle._id}`} 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    View Details / Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
