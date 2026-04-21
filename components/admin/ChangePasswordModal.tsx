import React from 'react';
import { Lock, X, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { UserDetail } from '../../types';

interface ChangePasswordModalProps {
    selectedUser: UserDetail;
    newPassword: string;
    setNewPassword: (pw: string) => void;
    confirmPassword: string;
    setConfirmPassword: (pw: string) => void;
    changingPassword: boolean;
    error: string | null;
    success: string | null;
    onClose: () => void;
    onChangePassword: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    selectedUser,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    changingPassword,
    error,
    success,
    onClose,
    onChangePassword
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-500" />
                        Cambiar Contraseña
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                    Cambiar contraseña de <span className="text-slate-50 font-medium">{selectedUser.user.name}</span>
                </p>
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-emerald-500 text-sm">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            {success}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onChangePassword}
                            disabled={changingPassword || !newPassword.trim() || !confirmPassword.trim()}
                            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-50 flex items-center justify-center gap-2"
                        >
                            {changingPassword ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Cambiar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
