import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../src/api/services/superAdminApi';

export const useAuditLogs = (initialFilters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchAuditLogs = async (newFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getAuditLogs(newFilters);
      setLogs(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    fetchAuditLogs(newFilters);
  };

  const exportLogs = async (exportFilters = filters) => {
    try {
      const response = await superAdminAPI.exportAuditLogs(exportFilters);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || 'Failed to export audit logs'
      );
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    filters,
    fetchAuditLogs,
    updateFilters,
    exportLogs,
  };
};



