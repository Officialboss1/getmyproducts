import { api } from './api';

// Super Admin specific API endpoints
export const superAdminAPI = {
  // Admin Management
  getAdmins: () => api.get('/users?role=admin'),
  createAdmin: (adminData) => api.post('/users/admin', adminData),
  updateAdmin: (adminId, updateData) => api.put(`/users/${adminId}`, updateData),
  deleteAdmin: (adminId) => api.delete(`/users/${adminId}`),

  // System-wide User Management
  getAllUsers: (params = {}) => api.get('/users', { params }),

  getAllSalespersons: async (params = {}) => {
    const response = await api.get('/users', {
      params: { role: 'salesperson', ...params }
    });
    let users = response.data.users || [];
    if (Array.isArray(users)) {
      if (params.sort === 'performance') {
        users = users.sort((a, b) => (b.performance || 0) - (a.performance || 0));
      }
      if (params.limit) {
        users = users.slice(0, params.limit);
      }
    }
    return { data: users };
  },

  getAllCustomers: async () => {
    const response = await api.get('/users', { params: { role: 'customer' } });
    return { data: response.data.users || [] };
  },

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

  // 🆕 Sales Summary (Fix for SuperAdminDashboard)
  getSalesSummary: () => api.get('/sales/summary'),

  // 🆕 Recent Activities (Optional for Dashboard Feed)
  getRecentActivities: () => api.get('/activities/recent'),

  // Send message to user
  sendMessage: (userId, messageData) => api.post(`/users/${userId}/message`, messageData),

  // Update user (generic)
  updateUser: (userId, updateData) => api.put(`/users/${userId}`, updateData),

  // Delete user (generic)
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default superAdminAPI;
