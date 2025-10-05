import { useState, useEffect } from 'react';
import { customerAPI } from '../services/customerApi';

export const useCustomer = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomer = async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await customerAPI.getCustomerProfile(customerId);
      setCustomer(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer data');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (updateData) => {
    try {
      const response = await customerAPI.updateCustomerProfile(customerId, updateData);
      setCustomer(response.data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update customer profile');
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  return {
    customer,
    loading,
    error,
    updateCustomer,
    refetch: fetchCustomer,
  };
};