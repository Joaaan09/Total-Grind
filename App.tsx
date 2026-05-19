import React from 'react';
import * as Sentry from "@sentry/react";
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { TrainingDataProvider } from './contexts/TrainingDataContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <TrainingDataProvider>
          <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </HashRouter>
        </TrainingDataProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default Sentry.withErrorBoundary(App, {
  fallback: (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Ups! Algo salió mal.</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Ha ocurrido un error inesperado. El equipo técnico ha sido notificado automáticamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-brandRed-600 hover:bg-brandRed-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
      >
        Recargar aplicación
      </button>
    </div>
  ),
  showDialog: true,
});