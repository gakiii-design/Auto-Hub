import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/bookings`;

class BookingService {
  // Get all bookings
  static async getBookings() {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get a single booking by ID
  static async getBookingById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(bookingData) {
    try {
      const response = await axios.post(API_URL, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Update an existing booking
  static async updateBooking(id, bookingData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  }

  // Delete a booking
  static async deleteBooking(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  }

  // Get bookings by user ID
  static async getBookingsByUser(userId) {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  }

  // Update booking status
  static async updateBookingStatus(id, status) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating booking ${id} status:`, error);
      throw error;
    }
  }
}

export default BookingService;
