import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const Maintenance = ({ userId }) => {
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch maintenance info from backend
  const fetchMaintenance = async () => {
    setMessage('');
    setInfo(null);
    try {
      const res = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (res.ok) {
        setInfo(data);
      } else {
        setMessage(data.error || 'Could not fetch maintenance info');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div>
      <h2>Maintenance Schedule</h2>
      <button onClick={fetchMaintenance} disabled={!userId}>Check Next Maintenance</button>
      {message && <p>{message}</p>}
      {info && (
        <div style={{ marginTop: 16 }}>
          <p><strong>Current Mileage:</strong> {info.current_mileage} km</p>
          <p><strong>Next Maintenance Mileage:</strong> {info.next_mileage} km</p>
          <p><strong>Next Service Date:</strong> {info.next_service_date}</p>
          <p style={{ color: '#1976d2' }}><strong>Recommendation:</strong> {info.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default Maintenance; 