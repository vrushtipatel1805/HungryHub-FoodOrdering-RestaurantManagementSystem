import api from './api';

export const getMenuItems = async () => api.get('/menu-items/');
export const getMenuCategories = async () => api.get('/menu-categories/');
export const createOrder = async (payload) => api.post('/orders/', payload);
export const getOrders = async () => api.get('/orders/');
export const getOrderById = async (id) => api.get(`/orders/${id}/`);
export const updateOrderStatus = async (id, payload) => api.patch(`/orders/${id}/`, payload);

export const getCart = async () => api.get('/cart/');
export const addCartItem = async (menuItemId, quantity = 1) => api.post('/cart/add/', { menu_item_id: menuItemId, quantity });
export const updateCartItem = async (menuItemId, delta, quantity) => api.post('/cart/update/', { menu_item_id: menuItemId, delta, quantity });
export const removeCartItem = async (menuItemId) => api.post('/cart/remove/', { menu_item_id: menuItemId });
export const clearCartApi = async () => api.post('/cart/clear/');
