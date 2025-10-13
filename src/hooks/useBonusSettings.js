import { useState, useEffect, useCallback } from 'react';
import { superAdminAPI } from '../api/services/superAdminApi';

// Global state for bonus settings to ensure consistency across components
let globalBonusSettings = null;
let globalSettingsListeners = [];

const notifyListeners = (settings) => {
  globalBonusSettings = settings;
  globalSettingsListeners.forEach(callback => callback(settings));
};

export const useBonusSettings = () => {
  const [settings, setSettings] = useState(globalBonusSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Listen for global settings changes
  useEffect(() => {
    const listener = (newSettings) => {
      setSettings(newSettings);
      setLastUpdated(new Date());
    };

    globalSettingsListeners.push(listener);

    // If we already have global settings, use them
    if (globalBonusSettings) {
      setSettings(globalBonusSettings);
    }

    return () => {
      globalSettingsListeners = globalSettingsListeners.filter(cb => cb !== listener);
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getReferralSettings();
      const newSettings = response.data;
      notifyListeners(newSettings);
      return newSettings;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch bonus settings';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (settingsData) => {
    setLoading(true);
    try {
      const response = await superAdminAPI.updateReferralSettings(settingsData);
      const updatedSettings = response.data;
      notifyListeners(updatedSettings);
      setLastUpdated(new Date());
      return updatedSettings;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update bonus settings';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch if no global settings exist
  useEffect(() => {
    if (!globalBonusSettings) {
      fetchSettings().catch(() => {
        // Silently handle initial load errors
      });
    }
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    lastUpdated,
    updateSettings,
    refetch: fetchSettings,
    // Utility functions
    formatCurrency: (value) => {
      if (value === null || value === undefined) return '$0.00';
      return `$${Number(value).toFixed(2)}`;
    },
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime()) > 300000 : false, // 5 minutes
  };
};

// Hook for components that only need to display bonus values
export const useBonusValues = () => {
  const { settings, formatCurrency, isStale } = useBonusSettings();

  return {
    referralBonus: settings?.referralBonus || 0,
    teamHeadBonus: settings?.teamHeadBonus || 0,
    maxReferralBonus: settings?.maxReferralBonus || 0,
    formatCurrency,
    isStale,
    hasSettings: !!settings,
  };
};