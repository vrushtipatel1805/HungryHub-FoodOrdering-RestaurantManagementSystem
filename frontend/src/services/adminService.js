import api from './api';

export const getDashboardStats = async () => api.get('/admin/dashboard/');
export const getBookings = async () => api.get('/admin/bookings/');
export const getEvents = async () => api.get('/admin/events/');
export const createEvent = async (payload) => api.post('/admin/events/', payload);
