import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { Dumbbell, Mail, Lock, User, Loader2, Copy, Check } from 'lucide-react';

interface AuthPageProps {
    onToggleMode: () => void;
    isLogin: boolean;
}

export const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState<'email' | 'pass' | null>(null);

    const handleCopy = (text: string, type: 'email' | 'pass') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };


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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-2 text-blue-500 mb-3 sm:mb-4">
                        <Dumbbell size={24} className="sm:block hidden" />
                        <Dumbbell size={20} className="sm:hidden" />
                        <span className="text-xl sm:text-2xl font-bold">TotalGrind</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Iniciar Sesión</CardTitle>
                    <p className="text-slate-400 text-xs sm:text-sm">Accede a tu cuenta para continuar</p>

                    <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-2 text-left">
                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Email de prueba</span>
                                <span className="text-xs sm:text-sm font-mono text-slate-300">test@totalgrind.com</span>
                            </div>
                            <button
                                onClick={() => handleCopy('test@totalgrind.com', 'email')}
                                className="p-2 hover:bg-blue-500/10 rounded-md transition-colors text-slate-500 hover:text-blue-400"
                                title="Copiar email"
                            >
                                {copied === 'email' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Contraseña</span>
                                <span className="text-xs sm:text-sm font-mono text-slate-300">passTest</span>
                            </div>
                            <button
                                onClick={() => handleCopy('passTest', 'pass')}
                                className="p-2 hover:bg-blue-500/10 rounded-md transition-colors text-slate-500 hover:text-blue-400"
                                title="Copiar contraseña"
                            >
                                {copied === 'pass' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {error && (
                            <div className="bg-red-900/20 border border-red-900 text-red-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Email</label>
                            <div className="relative">
                                <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block" size={16} />
                                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:hidden" size={14} />
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-8 sm:pl-10"
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
                                    className="pl-8 sm:pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
                        <span className="text-slate-400">¿No tienes cuenta? </span>
                        <button
                            onClick={onSwitchToRegister}
                            className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Regístrate
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const Register: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await register(email, password, name, role);

        if (!result.success) {
            setError(result.error || 'Error al registrar');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-2 text-blue-500 mb-3 sm:mb-4">
                        <Dumbbell size={24} className="sm:block hidden" />
                        <Dumbbell size={20} className="sm:hidden" />
                        <span className="text-xl sm:text-2xl font-bold">TotalGrind</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">Crear Cuenta</CardTitle>
                    <p className="text-slate-400 text-xs sm:text-sm">Únete y empieza a entrenar</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {error && (
                            <div className="bg-red-900/20 border border-red-900 text-red-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block" size={16} />
                                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:hidden" size={14} />
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-8 sm:pl-10"
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
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-8 sm:pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm text-slate-400">Tipo de usuario</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRole('athlete')}
                                    className={`p-2.5 sm:p-3 rounded-md border text-xs sm:text-sm font-medium transition-colors ${role === 'athlete'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    🏋️ Atleta
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('coach')}
                                    className={`p-2.5 sm:p-3 rounded-md border text-xs sm:text-sm font-medium transition-colors ${role === 'coach'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    📋 Entrenador
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Creando cuenta...
                                </>
                            ) : (
                                'Crear Cuenta'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
                        <span className="text-slate-400">¿Ya tienes cuenta? </span>
                        <button
                            onClick={onSwitchToLogin}
                            className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Inicia sesión
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};