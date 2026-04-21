import React from 'react';
import { UserPlus, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CreateUserModalProps {
    newUserData: any;
    setNewUserData: (data: any) => void;
    onClose: () => void;
    onCreate: () => void;
    creatingUser: boolean;
    error: string | null;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    newUserData,
    setNewUserData,
    onClose,
    onCreate,
    creatingUser,
    error
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-slate-400" />
                        Crear Usuario
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                        <input
                            type="text"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            placeholder="Nombre completo"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            placeholder="email@ejemplo.com"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Rol</label>
                        <select
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-slate-500 focus:outline-none"
                        >
                            <option value="athlete">Atleta</option>
                            <option value="coach">Entrenador</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onCreate}
                            disabled={creatingUser}
                            className="flex-1 px-4 py-2 bg-brandRed-500 hover:bg-brandRed-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-50 flex items-center justify-center gap-2"
                        >
                            {creatingUser ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Crear
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
