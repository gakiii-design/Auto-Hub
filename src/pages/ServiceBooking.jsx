import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

function ServiceBooking() {
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setUserEmail(user.email);
      setUserId(user.id);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setMessage("❌ Please login first to book a service.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          service_type: serviceType,
          date,
          time,
          user_email: userEmail,
          user_id: userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Booking successful! Check your email for confirmation.");
        setServiceType("");
        setDate("");
        setTime("");
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to book"}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Could not connect to backend.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book a Service</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Service Type:</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
          >
            <option value="">Select a service</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Tire Rotation">Tire Rotation</option>
            <option value="Brake Inspection">Brake Inspection</option>
            <option value="Engine Diagnostic">Engine Diagnostic</option>
            <option value="AC Service">AC Service</option>
            <option value="Transmission Service">Transmission Service</option>
          </select>
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        {userEmail && (
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={userEmail}
              readOnly
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>
        )}
        <button type="submit" disabled={!userEmail || !serviceType || !date || !time}>
          Book Now
        </button>
      </form>
      {message && <p>{message}</p>}
      {!userEmail && (
        <p style={{ color: 'red' }}>Please login to book a service.</p>
      )}
    </div>
  );
}

export default ServiceBooking;
