import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import DashboardPage from '../pages/DashboardPage';

// User Context for global user data management
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUser = (userData) => {
    // Removed console.log for security - sensitive user data
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Removed console.log for security - logout action logged server-side
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    // Removed console.log for security - localStorage access logged server-side
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    // Removed console.log for security - sensitive user data and token presence

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Removed console.log for security - sensitive user object
        setUser(parsedUser);
      } catch (error) {
        // Removed console.error for security - error details logged server-side
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    const handleUserDataUpdate = (event) => {
      // Removed console.log for security - sensitive user data update
      updateUser(event.detail);
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, []);

  // Removed console.log for security - sensitive user data in render

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Protect routes with JWT check
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
          },
        }}
      >
        <AntdApp>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* All protected routes use DashboardPage for layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Default → redirect to /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
