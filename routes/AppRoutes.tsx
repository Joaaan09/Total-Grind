import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ProgressPage } from '../pages/ProgressPage';
import { ProfilePage } from '../pages/ProfilePage';
import { CoachDashboardPage } from '../pages/CoachDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { Login, Register } from '../components/Auth';
import { AdminLogin } from '../components/AdminLogin';
import { ProtectedRoute, AuthRoute, AdminProtectedRoute, AdminAuthRoute } from './RouteGuards';
import { TrainingPage } from '../pages/TrainingPage';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Convertir el usuario del contexto de autenticación al tipo User de la aplicación
  const appUser: User | null = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    coachId: user.coachId,
    profilePicture: user.profilePicture
  } : null;

  return (
    <Routes>
      {/* Rutas de autenticación exclusivas de Admin */}
      <Route
        path="/admin/login"
        element={
          <AdminAuthRoute>
            <AdminLogin />
          </AdminAuthRoute>
        }
      />

      {/* Rutas protegidas de Admin */}
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Rutas de autenticación normales */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            {authMode === 'login'
              ? <Login onSwitchToRegister={() => setAuthMode('register')} />
              : <Register onSwitchToLogin={() => setAuthMode('login')} />
            }
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register onSwitchToLogin={() => setAuthMode('login')} />
          </AuthRoute>
        }
      />

      {/* Rutas protegidas normales */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage
                user={appUser!}
                onNavigate={(path) => window.location.hash = path}
              />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/:blockId?"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <ProgressPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage user={appUser!} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach"
        element={
          <ProtectedRoute>
            <Layout>
              <CoachDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
