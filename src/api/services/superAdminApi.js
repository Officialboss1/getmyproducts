import { api } from './api';

// Super Admin specific API endpoints
export const superAdminAPI = {
  // Admin Management
  getAdmins: () => api.get('/users?role=admin'),
  createAdmin: (adminData) => api.post('/users/admin', adminData),
  updateAdmin: (adminId, updateData) =>
    api.put(`/users/${adminId}`, updateData),
  deleteAdmin: (adminId) => api.delete(`/users/${adminId}`),

  // System-wide User Management
  getAllUsers: (params = {}) => api.get('/users', { params }),

  getAllSalespersons: async (params = {}) => {
    const response = await api.get('/users', {
      params: { role: 'salesperson', ...params },
    });
    let users = response.data.users || [];
    if (Array.isArray(users)) {
      if (params.sort === 'performance') {
        users = users.sort(
          (a, b) => (b.performance || 0) - (a.performance || 0)
        );
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
  updateReferralSettings: (settingsData) =>
    api.put('/settings/referrals', settingsData),

  // System Analytics
  getSystemAnalytics: (filters = {}) =>
    api.get('/analytics/system', { params: filters }),
  exportSystemReport: (format = 'csv', filters = {}) =>
    api.get('/analytics/export', {
      params: { format, ...filters },
      responseType: 'blob',
    }),

  // Audit Logs
  getAuditLogs: (filters = {}) => api.get('/audit', { params: filters }),
  exportAuditLogs: (filters = {}) =>
    api.get('/audit/export', {
      params: filters,
      responseType: 'blob',
    }),

  // System-wide Competitions
  getAllCompetitions: () => api.get('/competitions/all'),
  createGlobalCompetition: (competitionData) =>
    api.post('/competitions/global', competitionData),

  // System Settings
  getSystemSettings: () => api.get('/settings/system'),
  updateSystemSettings: (settingsData) =>
    api.put('/settings/system', settingsData),

  // 🆕 Sales Summary (Fix for SuperAdminDashboard)
  getSalesSummary: () => api.get('/super-admin/sales/summary'),

  // 🆕 Recent Activities (Optional for Dashboard Feed)
  getRecentActivities: () => api.get('/super-admin/activities/recent'),

  // 🆕 All Users for Dashboard Stats
  getAllUsers: () => api.get('/super-admin/users/all'),

  // 🆕 Chat Summary for Dashboard
  getChatSummary: () => api.get('/super-admin/chat/summary'),

  // 🆕 Products Management (Super Admin can manage all)
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
  toggleProductStatus: (productId) => api.patch(`/products/${productId}/toggle-status`),

  // 🆕 Orders Management (Super Admin can manage all)
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrder: (orderId, orderData) => api.put(`/orders/${orderId}`, orderData),
  deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
  updateOrderStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/status`, statusData),
  getAvailableProducts: () => api.get('/orders/products/available'),

  // Send message to user
  sendMessage: (userId, messageData) =>
    api.post(`/users/${userId}/message`, messageData),

  // Update user (generic)
  updateUser: (userId, updateData) => api.put(`/users/${userId}`, updateData),

  // Delete user (generic)
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default superAdminAPI;
