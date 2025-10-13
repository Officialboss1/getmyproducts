import { useState, useEffect } from 'react';
import { adminAPI } from '../../src/api/services/adminApi';

export const useUsers = (role = '') => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (userRole = role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getUsers(userRole);
      // Backend returns { users: [...], pagination: {...} }
      setUsers(response.data?.users || []);
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
      const response = await adminAPI.createUser(userData);
      await fetchUsers(); // Refresh the list
      return response.data;
    } catch (err) {
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



