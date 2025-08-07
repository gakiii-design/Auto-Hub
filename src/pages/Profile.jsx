import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const Profile = ({ userId }) => {
  const [vehicle, setVehicle] = useState({
    mileage: '',
    manufacture_year: '',
    last_service_date: '',
    terrain_type: '',
    current_performance: '',
    likely_locations: ''
  });
  const [message, setMessage] = useState('');

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, vehicle })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.error || 'Profile update failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  // Handles input changes for vehicle fields
  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2>Vehicle Profile Setup</h2>
      <form onSubmit={handleSubmit}>
        <input name="mileage" type="number" placeholder="Mileage" value={vehicle.mileage} onChange={handleChange} required />
        <input name="manufacture_year" type="number" placeholder="Manufacture Year" value={vehicle.manufacture_year} onChange={handleChange} required />
        <input name="last_service_date" type="date" placeholder="Last Service Date" value={vehicle.last_service_date} onChange={handleChange} required />
        <input name="terrain_type" type="text" placeholder="Terrain Type" value={vehicle.terrain_type} onChange={handleChange} required />
        <input name="current_performance" type="text" placeholder="Current Performance" value={vehicle.current_performance} onChange={handleChange} required />
        <input name="likely_locations" type="text" placeholder="Likely Locations" value={vehicle.likely_locations} onChange={handleChange} required />
        <button type="submit">Save Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Profile; 