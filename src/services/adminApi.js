import { api, apiUtils } from "./api";

/**
 * Admin API
 * ----------------------------------------
 * Handles user management, targets, competitions,
 * analytics, and dashboard operations for Admins
 */

export const adminAPI = {
  /* ===============================
   * USER MANAGEMENT
   * =============================== */
  getUsers: (role = "") => api.get("/users", { params: { role } }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  createUser: (userData) => api.post("/users", userData),
  updateUser: (userId, updateData) => api.put(`/users/${userId}`, updateData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),




  /* ===============================
   * TARGETS MANAGEMENT
   * =============================== */
  getTargets: (userId = "") => {
    const url = userId ? `/targets/${userId}` : "/targets";
    return api.get(url);
  },
  setTargets: (targetData) => api.post("/targets", targetData),
  updateTargets: (userId, targetData) => api.put(`/targets/${userId}`, targetData),
  deleteTargets: (userId) => api.delete(`/targets/${userId}`),

  /* ===============================
   * REFERRAL SETTINGS
   * =============================== */
  getReferralSettings: () => api.get("/settings/referrals"),
  updateReferralSettings: (settingsData) => api.put("/settings/referrals", settingsData),

  /* ===============================
   * COMPETITIONS MANAGEMENT
   * =============================== */
  getCompetitions: () => api.get("/competitions"),
  getCompetitionById: (competitionId) => api.get(`/competitions/${apiUtils.sanitizePathId(competitionId)}`),
  createCompetition: (competitionData) => api.post("/competitions", competitionData),
  updateCompetition: (competitionId, competitionData) =>
    api.put(`/competitions/${apiUtils.sanitizePathId(competitionId)}`, competitionData),
  deleteCompetition: (competitionId) => api.delete(`/competitions/${apiUtils.sanitizePathId(competitionId)}`),
  getCompetitionLeaderboard: (competitionId) =>
    api.get(`/competitions/${apiUtils.sanitizePathId(competitionId)}/leaderboard`),

  /* ===============================
   * ANALYTICS
   * =============================== */


  // getSystemAnalytics: (filters = {}) => api.get('/analytics/system', { params: filters }),
  getSystemAnalytics: (filters = {}) => api.get('/analytics/system', { params: filters }),


  getProgress: (userId = "", period = "monthly") => {
    const url = userId ? `/analytics/progress/${userId}` : "/analytics/progress";
    return api.get(url, { params: { period } });
  },

  getLeaderboard: (params = {}) => api.get("/analytics/leaderboard", { params }),

  /* ===============================
   * CUSTOMERS (optional feature)
   * =============================== */
  getCustomers: () => api.get("/customers"),
  getCustomerById: (customerId) => api.get(`/customers/${customerId}`),

  /* ===============================
   * AUDIT LOGS
   * =============================== */
  getAuditLogs: (filters = {}) => api.get("/audit", { params: filters }),

   getRecentActivities: (params = {}) => api.get("/audit/recent", { params }),

  /* ===============================
   * SYSTEM HEALTH (Live)
   * =============================== */
  getSystemHealth: () => api.get("/system/health"),
  // Activity settings (who counts as 'active')
  getActivitySettings: () => api.get('/settings/activity'),
  updateActivitySettings: (payload) => api.put('/settings/activity', payload),
};

export default adminAPI;
