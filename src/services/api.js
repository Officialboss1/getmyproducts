import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update if backend runs elsewhere
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error);
      throw new Error("Network error: Please check your internet connection");
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        break;
      
      case 403:
        // Forbidden - user doesn't have permission
        console.error("Forbidden:", data.message);
        throw new Error(data.message || "You don't have permission to perform this action");
      
      case 404:
        // Not found
        console.error("Resource not found:", data.message);
        throw new Error(data.message || "Resource not found");
      
      case 422:
        // Validation error
        console.error("Validation error:", data.errors);
        throw new Error(data.message || "Validation failed");
      
      case 429:
        // Rate limit exceeded
        console.error("Rate limit exceeded:", data.message);
        throw new Error(data.message || "Too many requests. Please try again later");
      
      case 500:
        // Server error
        console.error("Server error:", data.message);
        throw new Error(data.message || "Internal server error. Please try again later");
      
      default:
        console.error("API error:", error);
        throw new Error(data?.message || "An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => 
    api.post("/auth/login", credentials),
  
  register: (userData) => 
    api.post("/auth/register", userData),
  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },
  
  refreshToken: () => 
    api.post("/auth/refresh"),
  
  getProfile: () => 
    api.get("/auth/profile"),
  
  updateProfile: (userData) => 
    api.put("/auth/profile", userData),
};

// Users & Roles APIs
export const usersAPI = {
  getAllUsers: (params = {}) => 
    api.get("/users", { params }),
  
  getUserById: (userId) => 
    api.get(`/users/${userId}`),
  
  updateUserRole: (userId, roleData) => 
    api.patch(`/users/${userId}/role`, roleData),
  
  updateUser: (userId, userData) => 
    api.put(`/users/${userId}`, userData),
  
  deleteUser: (userId) => 
    api.delete(`/users/${userId}`),
  
  getSalesTeam: () => 
    api.get("/users/team"),
};

// Products APIs
export const productsAPI = {
  getProducts: (params = {}) => 
    api.get("/products", { params }),
  
  getProductById: (productId) => 
    api.get(`/products/${productId}`),
  
  createProduct: (productData) => 
    api.post("/products", productData),
  
  updateProduct: (productId, productData) => 
    api.put(`/products/${productId}`, productData),
  
  deleteProduct: (productId) => 
    api.delete(`/products/${productId}`),
};

// Sales APIs
export const salesAPI = {
  getSales: (params = {}) => {
    const { userId, startDate, endDate, productId, page, limit } = params;
    return api.get("/sales", { 
      params: { 
        userId, 
        startDate, 
        endDate, 
        productId,
        page,
        limit
      } 
    });
  },
  
  getSaleById: (saleId) => 
    api.get(`/sales/${saleId}`),
  
  addSale: (saleData) => 
    api.post("/sales", saleData),
  
  updateSale: (saleId, saleData) => 
    api.put(`/sales/${saleId}`, saleData),
  
  deleteSale: (saleId) => 
    api.delete(`/sales/${saleId}`),
  
  getSalesSummary: (params = {}) => 
    api.get("/sales/summary", { params }),
  
  exportSales: (params = {}) => 
    api.get("/sales/export", { 
      params,
      responseType: 'blob' // For file downloads
    }),
};

// Targets APIs
export const targetsAPI = {
  getTargets: (userId = "") => {
    const url = userId ? `/targets/${userId}` : "/targets";
    return api.get(url);
  },
  
  setTargets: (targetData) => 
    api.post("/targets", targetData),
  
  updateTargets: (userId, targetData) => 
    api.put(`/targets/${userId}`, targetData),
  
  deleteTargets: (userId) => 
    api.delete(`/targets/${userId}`),
  
  getDefaultTargets: () => 
    api.get("/targets/default"),
  
  updateDefaultTargets: (targetData) => 
    api.put("/targets/default", targetData),
};

// Analytics & Progress APIs
export const analyticsAPI = {
  getProgress: (userId = '', period = 'monthly') =>
    api.get(`/analytics/progress/${userId}?period=${period}`),

  getLeaderboard: (period = 'monthly') =>
    api.get(`/analytics/leaderboard?period=${period}`),

  getDailySales: () =>
    api.get(`/analytics/daily`),

  getLeaderboard: (params = {}) => 
    api.get("/analytics/leaderboard", { params }),

  getPerformanceTrend: (userId = "", period = "monthly") => {
    const url = userId ? `/analytics/trend/${userId}` : "/analytics/trend";
    return api.get(url, { params: { period } });
  },

  getSalesAnalytics: (params = {}) => 
    api.get("/analytics/sales", { params }),

  getRevenueAnalytics: (params = {}) => 
    api.get("/analytics/revenue", { params }),

  getComparisonData: (params = {}) => 
    api.get("/analytics/comparison", { params }),
};

// Competitions APIs
export const competitionsAPI = {
  getCompetitions: (params = {}) => 
    api.get("/competitions", { params }),
  
  getCompetitionById: (competitionId) => 
    api.get(`/competitions/${competitionId}`),
  
  createCompetition: (competitionData) => 
    api.post("/competitions", competitionData),
  
  updateCompetition: (competitionId, competitionData) => 
    api.put(`/competitions/${competitionId}`, competitionData),
  
  deleteCompetition: (competitionId) => 
    api.delete(`/competitions/${competitionId}`),
  
  joinCompetition: (competitionId) => 
    api.post(`/competitions/${competitionId}/join`),
  
  leaveCompetition: (competitionId) => 
    api.post(`/competitions/${competitionId}/leave`),
  
  getCompetitionLeaderboard: (competitionId) => 
    api.get(`/competitions/${competitionId}/leaderboard`),
  
  getMyCompetitions: () => 
    api.get("/competitions/my-competitions"),
};

// Audit Logs APIs
export const auditAPI = {
  getAuditLogs: (params = {}) => 
    api.get("/audit", { params }),
  
  getAuditLogById: (logId) => 
    api.get(`/audit/${logId}`),
  
  exportAuditLogs: (params = {}) => 
    api.get("/audit/export", { 
      params,
      responseType: 'blob'
    }),
};

// TODO: THESE ENDPOINTS NEED TO BE IMPLEMENTED ON BACKEND
// Referrals APIs
export const referralsAPI = {
  getMyReferrals: () => 
    api.get("/referrals/my-referrals"), // MISSING ENDPOINT
  
  getReferralProgress: () => 
    api.get("/referrals/progress"), // MISSING ENDPOINT
  
  createReferral: (referralData) => 
    api.post("/referrals", referralData), // MISSING ENDPOINT
  
  getReferralStats: () => 
    api.get("/referrals/stats"), // MISSING ENDPOINT
  
  validateReferralCode: (code) => 
    api.post("/referrals/validate", { code }), // MISSING ENDPOINT
};

// Teams APIs
export const teamsAPI = {
  getTeam: (teamId) => 
    api.get(`/teams/${teamId}`), // MISSING ENDPOINT
  
  getTeamMembers: (teamId) => 
    api.get(`/teams/${teamId}/members`), // MISSING ENDPOINT
  
  getMyTeam: () => 
    api.get("/teams/my-team"), // MISSING ENDPOINT
  
  createTeam: (teamData) => 
    api.post("/teams", teamData), // MISSING ENDPOINT
  
  updateTeam: (teamId, teamData) => 
    api.put(`/teams/${teamId}`, teamData), // MISSING ENDPOINT
  
  getTeamPerformance: (teamId) => 
    api.get(`/teams/${teamId}/performance`), // MISSING ENDPOINT
};

// Settings APIs
export const settingsAPI = {
  getSystemSettings: () => 
    api.get("/settings"), // MISSING ENDPOINT
  
  updateSystemSettings: (settingsData) => 
    api.put("/settings", settingsData), // MISSING ENDPOINT
  
  getReferralSettings: () => 
    api.get("/settings/referral"), // MISSING ENDPOINT
  
  updateReferralSettings: (settingsData) => 
    api.put("/settings/referral", settingsData), // MISSING ENDPOINT
};

// Dashboard-specific APIs (aggregated data)
export const dashboardAPI = {
  getSalespersonDashboard: () => 
    api.get("/dashboard/salesperson"),
  
  getAdminDashboard: () => 
    api.get("/dashboard/admin"),
  
  getSuperAdminDashboard: () => 
    api.get("/dashboard/super-admin"),
  
  getKPIs: (params = {}) => 
    api.get("/dashboard/kpis", { params }),
};

// Utility functions
export const apiUtils = {
  // Helper to handle file downloads
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Helper to format error messages
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  },

  // Helper to check if user has specific role
  hasRole: (requiredRole) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role === requiredRole;
  },

  // Helper to check if user has any of the required roles
  hasAnyRole: (requiredRoles) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return requiredRoles.includes(user.role);
  },
};

// Export the base api instance for custom requests
export { api };

// Export all APIs as a single object for easy importing
export default {
  auth: authAPI,
  users: usersAPI,
  products: productsAPI,
  sales: salesAPI,
  targets: targetsAPI,
  analytics: analyticsAPI,
  competitions: competitionsAPI,
  audit: auditAPI,
  referrals: referralsAPI,
  teams: teamsAPI,
  settings: settingsAPI,
  dashboard: dashboardAPI,
  utils: apiUtils,
  instance: api,
};