import React from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { AuthContext } from '../contexts/AuthContext';
import { TrainingPage } from './TrainingPage';

export const AdminTrainingPage: React.FC = () => {
    const adminAuth = useAdminAuth();

    // Sobrescribimos el contexto normal con los datos del admin para que TrainingPage y sus componentes
    // hijos (WorkoutSession, EditBlockModal) usen el token y rol correctos sin requerir modificaciones en ellos.
    return (
        <AuthContext.Provider value={{
            user: adminAuth.user as any,
            token: adminAuth.token,
            isAuthenticated: adminAuth.isAuthenticated,
            isLoading: adminAuth.isLoading,
            login: async () => ({ success: false }),
            register: async () => ({ success: false }),
            logout: adminAuth.logout,
            refreshUser: adminAuth.refreshUser
        }}>
            <TrainingPage />
        </AuthContext.Provider>
    );
};
