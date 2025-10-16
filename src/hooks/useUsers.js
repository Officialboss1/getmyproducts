import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../src/api/services/adminApi';

export const useUsers = (role = '', options = {}) => {
  const { all = false } = options;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize cache key to prevent unnecessary re-computations
  const cacheKey = useMemo(() => `users_${role}_${all}`, [role, all]);

  const fetchUsers = useCallback(async (userRole = role) => {
    // Prevent duplicate requests for the same data
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      // For salesperson role, fetch only salesperson users (not sales_team)
      const apiRole = userRole;
      const params = all ? { role: apiRole, all: true } : { role: apiRole };

      // Removed console.log for security - sensitive API params logged server-side
      const response = await adminAPI.getUsers(apiRole, params);

      // API returns array when all=true, or { users: [...], pagination: {...} } otherwise
      const data = response.data;
      const fetchedUsers = Array.isArray(data) ? data : data?.users || [];

      // Removed console.log for security - sensitive user data (emails, roles)
      // Normalize users to have id field for frontend consistency
      const normalizedUsers = fetchedUsers.map(user => ({ ...user, id: user._id }));
      setUsers(normalizedUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      // Removed console.error for security - error details logged server-side
    } finally {
      setLoading(false);
    }
  }, [role, loading]);

  const updateUser = async (userId, updateData) => {
    try {
      const response = await adminAPI.updateUser(userId, updateData);
      await fetchUsers(); // Refresh the list
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const createUser = async (userData) => {
    try {
      // Removed console.log for security - sensitive user creation data
      const response = await adminAPI.createUser(userData);
      // Removed console.log for security - sensitive user creation response
      await fetchUsers(); // Refresh the list
      return response.data;
    } catch (err) {
      // Removed console.error for security - error details logged server-side
      throw new Error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    if (role) {
      fetchUsers();
    }
  }, [role, all]);

  return {
    users,
    loading,
    error,
    updateUser,
    createUser,
    deleteUser,
    refetch: fetchUsers,
  };
};



