import { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminApi';

export const useUsers = (role = '', options = {}) => {
  const { all = false } = options;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (userRole = role) => {
    setLoading(true);
    setError(null);
    try {
      // For salesperson role, fetch only salesperson users (not sales_team)
      const apiRole = userRole;
      const params = all ? { role: apiRole, all: true } : { role: apiRole };
      console.log('useUsers: fetching users with role:', apiRole, 'params:', params);
      const response = await adminAPI.getUsers(apiRole, params);
      // API returns array when all=true, or { users: [...], pagination: {...} } otherwise
      const data = response.data;
      const fetchedUsers = Array.isArray(data) ? data : data?.users || [];
      console.log('Fetched users from API:', fetchedUsers.map(u => ({ id: u._id, email: u.email, role: u.role })));
      // Normalize users to have id field for frontend consistency
      const normalizedUsers = fetchedUsers.map(user => ({ ...user, id: user._id }));
      setUsers(normalizedUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Creating user with data:', userData);
      const response = await adminAPI.createUser(userData);
      console.log('User creation response:', response.data);
      await fetchUsers(); // Refresh the list
      return response.data;
    } catch (err) {
      console.error('Create user error:', err);
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
    fetchUsers();
  }, [role]);

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