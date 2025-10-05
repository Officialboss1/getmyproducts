import api from './api';

// Customer specific API endpoints
export const customerAPI = {
  // Dashboard
  getCustomerDashboard: (customerId) => api.get(`/customers/${customerId}/dashboard`),
  
  // Purchase History
  getPurchaseHistory: (customerId, params = {}) => 
    api.get(`/customers/${customerId}/purchases`, { params }),
  
  // Rewards & Offers
  getRewards: (customerId) => api.get(`/customers/${customerId}/rewards`),
  redeemReward: (customerId, rewardId) => 
    api.post(`/customers/${customerId}/redeem`, { rewardId }),
  
  // Referral Information
  getReferralInfo: (customerId) => api.get(`/customers/${customerId}/referral`),
  
  // Notifications
  getNotifications: (customerId) => api.get(`/notifications/customer/${customerId}`),
  markNotificationRead: (customerId, notificationId) => 
    api.put(`/notifications/customer/${customerId}/read`, { notificationId }),
  markAllNotificationsRead: (customerId) => 
    api.put(`/notifications/customer/${customerId}/read-all`),
  
  // Profile
  getCustomerProfile: (customerId) => api.get(`/customers/${customerId}`),
  updateCustomerProfile: (customerId, data) => api.put(`/customers/${customerId}`, data),
  changePassword: (customerId, data) => api.put(`/customers/${customerId}/password`, data),
  
  // Support
  createSupportTicket: (customerId, data) => api.post(`/support/customer`, { customerId, ...data }),
  getSupportTickets: (customerId) => api.get(`/support/customer/${customerId}`),
  getSupportTicket: (ticketId) => api.get(`/support/tickets/${ticketId}`),
};

export default customerAPI;