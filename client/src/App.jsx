import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VisualizationProvider } from './context/VisualizationContext';
import MainLayout from './components/Layout/MainLayout';
import Scene from './components/ThreeBody/Scene';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

import ChatWidget from './components/Chat/ChatWidget'; // Import Widget

const App = () => {
  return (
    <AuthProvider>
      <VisualizationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Scene />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              <Route path="dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              <Route path="admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          <ChatWidget /> {/* Added Globally */}
        </BrowserRouter>
      </VisualizationProvider>
    </AuthProvider>
  );
};

export default App;
