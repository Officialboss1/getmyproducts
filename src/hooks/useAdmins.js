import { useState, useEffect } from 'react';
import { superAdminAPI } from '../services/superAdminApi';

export const useAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getAdmins();
      setAdmins(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData) => {
    try {
      const response = await superAdminAPI.createAdmin(adminData);
      await fetchAdmins(); // Refresh the list
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const updateAdmin = async (adminId, updateData) => {
    try {
      const response = await superAdminAPI.updateAdmin(adminId, updateData);
      await fetchAdmins(); // Refresh the list
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update admin');
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      await superAdminAPI.deleteAdmin(adminId);
      await fetchAdmins(); // Refresh the list
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    error,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refetch: fetchAdmins,
  };
};