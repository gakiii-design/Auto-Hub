import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Battery Check',
  'Engine Tune-Up',
];

const ServiceBooking = ({ onBookingSuccess }) => {
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    window.history.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      setMessage('Please select both date and time.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, date, time }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        console.error("Failed to parse JSON. Raw response:", text);
        setMessage('Server returned invalid response.');
        return;
      }

      if (response.ok) {
        setDate('');
        setTime('');
        setServiceType(SERVICE_TYPES[0]);
        if (onBookingSuccess) {
          onBookingSuccess({
            serviceType,
            date,
            time,
            message: 'Booking successful!',
            bookingId: data.booking_id || null,
          });
        }
      } else {
        setMessage('Failed to create booking: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('Unexpected error occurred.');
    }
  };

  return (
    <div className="service-booking">
      <h2>Book a Service</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Service Type:
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <br />
        <label>
          Time:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <br />
        <button type="submit">Book Service</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const BackArrow = () => {
  const handleBack = () => {
    console.log('Back arrow clicked');
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback navigation if no history
      window.location.href = '/';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleBack();
    }
  };

  return (
    <div
      style={{
        cursor: 'pointer',
        fontSize: '24px',
        marginBottom: '10px',
        userSelect: 'none',
      }}
      onClick={handleBack}
      aria-label="Go back"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      ← Back
    </div>
  );
};

const ServiceBookingWithBack = (props) => (
  <>
    <BackArrow />
    <ServiceBooking {...props} />
  </>
);

export default ServiceBookingWithBack;
