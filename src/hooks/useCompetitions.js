import { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminApi';

export const useCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getCompetitions();
      setCompetitions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch competitions');
      console.error('Error fetching competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCompetition = async (competitionData) => {
    try {
      const response = await adminAPI.createCompetition(competitionData);
      await fetchCompetitions(); // Refresh the list
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create competition');
    }
  };

  const updateCompetition = async (competitionId, competitionData) => {
    try {
      const response = await adminAPI.updateCompetition(competitionId, competitionData);
      await fetchCompetitions(); // Refresh the list
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update competition');
    }
  };

  const deleteCompetition = async (competitionId) => {
    try {
      await adminAPI.deleteCompetition(competitionId);
      await fetchCompetitions(); // Refresh the list
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete competition');
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    loading,
    error,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    refetch: fetchCompetitions,
  };
};