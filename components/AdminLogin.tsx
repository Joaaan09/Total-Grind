import React, { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { ShieldAlert, Mail, Lock, User, Loader2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const { login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Error al iniciar sesión');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-4">
            <Card className="w-full max-w-md border-purple-900/50">
                <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-2 text-purple-500 mb-3 sm:mb-4">
                        <ShieldAlert size={28} className="sm:block hidden" />
                        <ShieldAlert size={24} className="sm:hidden" />
                        <span className="text-xl sm:text-2xl font-bold">TotalGrind Admin</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Acceso Restringido</CardTitle>
                    <p className="text-slate-400 text-xs sm:text-sm">Panel de control para administradores</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {error && (
                            <div className="bg-red-900/20 border border-red-900 text-red-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Email de Administrador</label>
                            <div className="relative">
                                <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block" size={16} />
                                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:hidden" size={14} />
                                <Input
                                    type="email"
                                    placeholder="admin@totalgrind.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-8 sm:pl-10 focus-visible:ring-purple-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block" size={16} />
                                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:hidden" size={14} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-8 sm:pl-10 focus-visible:ring-purple-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Autenticando...
                                </>
                            ) : (
                                'Acceder al Panel'
                            )}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center text-xs sm:text-sm">
                        <a href="#/" className="text-slate-500 hover:text-slate-300 transition-colors">
                            ← Volver a la aplicación normal
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
