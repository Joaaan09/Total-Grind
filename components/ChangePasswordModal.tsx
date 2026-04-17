import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { Lock, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TrainingService } from '../services/mockService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { token } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña nueva debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        if (token) {
            const result = await TrainingService.changePassword(token, currentPassword, newPassword);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }, 1500);
            } else {
                setError(result.error || 'Error al cambiar contraseña');
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-slate-950 border-slate-800 shadow-xl relative animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute right-2 sm:right-4 top-2 sm:top-4 text-slate-400 hover:text-white"
                >
                    <X size={18} className="sm:block hidden" />
                    <X size={16} className="sm:hidden" />
                </button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Lock className="text-blue-500 flex-shrink-0 hidden sm:block" size={18} />
                        <Lock className="text-blue-500 flex-shrink-0 sm:hidden" size={16} />
                        Cambiar Contraseña
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-6 sm:py-8 text-green-500">
                            <p className="font-bold text-base sm:text-lg">¡Contraseña actualizada!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            {error && (
                                <div className="p-2 sm:p-3 bg-red-900/20 border border-red-900 text-red-400 text-xs sm:text-sm rounded">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm text-slate-400">Contraseña Actual</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="bg-slate-900"
                                />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm text-slate-400">Nueva Contraseña</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-slate-900"
                                />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm text-slate-400">Confirmar Nueva Contraseña</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-slate-900"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-xs sm:text-sm">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading || !currentPassword || !newPassword} className="text-xs sm:text-sm">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-1 sm:mr-2 hidden sm:inline" size={14} />
                                            <Loader2 className="animate-spin mr-1 sm:mr-2 sm:hidden" size={12} />
                                        </>
                                    ) : null}
                                    Actualizar
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
