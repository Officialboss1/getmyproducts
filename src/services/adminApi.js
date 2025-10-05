import api from './api';

// Admin specific API endpoints
export const adminAPI = {
  // User Management
  getUsers: (role = '') => api.get('/users', { params: { role } }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, updateData) => api.put(`/users/${userId}`, updateData),
  createUser: (userData) => api.post('/users', userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // Targets Management
  getTargets: (userId = '') => {
    const url = userId ? `/targets/${userId}` : '/targets';
    return api.get(url);
  },
  setTargets: (targetData) => api.post('/targets', targetData),
  updateTargets: (userId, targetData) => api.put(`/targets/${userId}`, targetData),
  deleteTargets: (userId) => api.delete(`/targets/${userId}`),
  
  // Referral Settings
  getReferralSettings: () => api.get('/settings/referrals'),
  updateReferralSettings: (settingsData) => api.put('/settings/referrals', settingsData),
  
  // Competitions Management
  getCompetitions: () => api.get('/competitions'),
  getCompetitionById: (competitionId) => api.get(`/competitions/${competitionId}`),
  createCompetition: (competitionData) => api.post('/competitions', competitionData),
  updateCompetition: (competitionId, competitionData) => api.put(`/competitions/${competitionId}`, competitionData),
  deleteCompetition: (competitionId) => api.delete(`/competitions/${competitionId}`),
  getCompetitionLeaderboard: (competitionId) => api.get(`/competitions/${competitionId}/leaderboard`),
  
  // Analytics
  getSystemAnalytics: (filters = {}) => api.get('/analytics/system', { params: filters }),
  getProgress: (userId = '', period = 'monthly') => {
    const url = userId ? `/analytics/progress/${userId}` : '/analytics/progress';
    return api.get(url, { params: { period } });
  },
  getLeaderboard: (params = {}) => api.get('/analytics/leaderboard', { params }),
  
  // Customers
  getCustomers: () => api.get('/customers'),
  getCustomerById: (customerId) => api.get(`/customers/${customerId}`),
  
  // Audit Logs (for Super Admin)
  getAuditLogs: (filters = {}) => api.get('/audit', { params: filters }),
};

export default adminAPI;