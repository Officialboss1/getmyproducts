import { useState, useEffect } from 'react';
import { usersAPI } from '../../src/api/services/api';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  const fetchProfile = async (id = userId) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await usersAPI.getUserProfile(id);
      setProfile(response.data.user);

      // Determine if current user can edit this profile
      // This is a basic check - in a real app, this might come from the backend
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const canEditProfile = checkEditPermissions(
        currentUser.role,
        response.data.user.role,
        currentUser._id === id
      );
      setCanEdit(canEditProfile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await usersAPI.updateUserProfile(userId, formData);
      setProfile(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAvatar = async () => {
    if (!userId) return;

    try {
      await usersAPI.deleteAvatar(userId);
      setProfile((prev) => ({ ...prev, avatar: null }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete avatar');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    canEdit,
    updateProfile,
    deleteUserAvatar,
    refetch: fetchProfile,
  };
};

// Helper function to check edit permissions
const checkEditPermissions = (currentUserRole, targetUserRole, isOwn) => {
  if (currentUserRole === 'super_admin') return true;
  if (currentUserRole === 'admin') {
    const lowerRoles = ['salesperson', 'customer', 'team_head'];
    return isOwn || lowerRoles.includes(targetUserRole);
  }
  return isOwn;
};



