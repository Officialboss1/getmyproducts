import api from './api';

// Super Admin specific API endpoints
export const superAdminAPI = {
  // Admin Management
  getAdmins: () => api.get('/users?role=admin'),
  createAdmin: (adminData) => api.post('/users/admin', adminData),
  updateAdmin: (adminId, updateData) => api.put(`/users/${adminId}`, updateData),
  deleteAdmin: (adminId) => api.delete(`/users/${adminId}`),
  
  // System-wide User Management
  getAllUsers: (params = {}) => api.get('/users/all', { params }),
  getAllSalespersons: (params = {}) => api.get('/users/salespersons', { params }),
  getAllCustomers: () => api.get('/users/customers'),
  
  // Global Targets Management
  getGlobalTargets: () => api.get('/settings/targets'),
  updateGlobalTargets: (targetData) => api.put('/settings/targets', targetData),
  
  // Referral System Settings
  getReferralSettings: () => api.get('/settings/referrals'),
  updateReferralSettings: (settingsData) => api.put('/settings/referrals', settingsData),
  
  // System Analytics
  getSystemAnalytics: (filters = {}) => api.get('/analytics/system', { params: filters }),
  exportSystemReport: (format = 'csv', filters = {}) => 
    api.get('/analytics/export', { 
      params: { format, ...filters },
      responseType: 'blob'
    }),
  
  // Audit Logs
  getAuditLogs: (filters = {}) => api.get('/audit', { params: filters }),
  exportAuditLogs: (filters = {}) => 
    api.get('/audit/export', { 
      params: filters,
      responseType: 'blob'
    }),
  
  // System-wide Competitions
  getAllCompetitions: () => api.get('/competitions/all'),
  createGlobalCompetition: (competitionData) => api.post('/competitions/global', competitionData),
  
  // System Settings
  getSystemSettings: () => api.get('/settings/system'),
  updateSystemSettings: (settingsData) => api.put('/settings/system', settingsData),
};

export default superAdminAPI;