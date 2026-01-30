import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'athlete' | 'coach' | 'admin';
    coachId?: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Comprobar si el usuario está autenticado al cargar el componente
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.user);
                        setToken(storedToken);
                    } else {
                        // Si el token es inválido, limpiar el almacenamiento local y el estado
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
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

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    const register = async (email: string, password: string, name: string, role: string = 'athlete') => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name, role })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Error al registrar' };
            }

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Refresh user failed:', error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
