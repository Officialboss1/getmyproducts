import { useState, useEffect } from 'react';
import { customerAPI } from '../../src/api/services/customerApi';

export const useCustomerPurchases = (customerId) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPurchases = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await customerAPI.getPurchaseHistory(customerId);
      setPurchases(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch purchase history'
      );
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [customerId]);

  return {
    purchases,
    loading,
    error,
    refetch: fetchPurchases,
  };
};



