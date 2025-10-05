import { useState, useEffect } from 'react';
import { superAdminAPI } from '../services/superAdminApi';

export const useReferralSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getReferralSettings();
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch referral settings');
      console.error('Error fetching referral settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settingsData) => {
    setLoading(true);
    try {
      const response = await superAdminAPI.updateReferralSettings(settingsData);
      setSettings(response.data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update referral settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};