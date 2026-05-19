import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AdminAuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
    const [isLoading, setIsLoading] = useState(true);

    // Comprobar si el admin está autenticado al cargar el componente
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('admin_token');
            if (storedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        // Solo permitimos roles de admin en este contexto
                        if (data.user.role === 'admin') {
                            setUser(data.user);
                            setToken(storedToken);
                        } else {
                            // Si no es admin, fuera
                            localStorage.removeItem('admin_token');
                            setToken(null);
                            setUser(null);
                        }
                    } else {
                        localStorage.removeItem('admin_token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Admin Auth check failed:', error);
                    localStorage.removeItem('admin_token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Error al iniciar sesión' };
            }

            if (data.user.role !== 'admin') {
                 return { success: false, error: 'Acceso denegado. No eres administrador.' };
            }

            localStorage.setItem('admin_token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Admin Login error:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user.role === 'admin') {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error('Refresh admin failed:', error);
            }
        }
    };

    return (
        <AdminAuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated: !!user && user.role === 'admin',
            login,
            logout,
            refreshUser
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
