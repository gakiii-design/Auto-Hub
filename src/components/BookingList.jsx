import React, { useEffect, useState } from 'react';
import BookingService from '../services/bookingService';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await BookingService.getBookings();
        setBookings(response.bookings);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Upcoming Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings available.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <strong>Service Type:</strong> {booking.service_type} <br />
              <strong>Date:</strong> {booking.date} <br />
              <strong>Time:</strong> {booking.time} <br />
              <strong>Status:</strong> {booking.status} <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingList;
