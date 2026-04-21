import React from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';
import { UserDetail } from '../../types';

interface AdminCreateBlockModalProps {
    selectedUser: UserDetail;
    newBlockTitle: string;
    setNewBlockTitle: (title: string) => void;
    creatingBlock: boolean;
    onClose: () => void;
    onCreate: () => void;
}

export const AdminCreateBlockModal: React.FC<AdminCreateBlockModalProps> = ({
    selectedUser,
    newBlockTitle,
    setNewBlockTitle,
    creatingBlock,
    onClose,
    onCreate
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-500" />
                        Crear Bloque para {selectedUser.user.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Nombre del Bloque</label>
                        <input
                            type="text"
                            value={newBlockTitle}
                            onChange={(e) => setNewBlockTitle(e.target.value)}
                            placeholder="Ej: Fase de Fuerza"
                            className="w-full bg-slate-700 text-slate-50 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
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
                            onClick={onCreate}
                            disabled={!newBlockTitle.trim() || creatingBlock}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-50 flex items-center justify-center gap-2"
                        >
                            {creatingBlock ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
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
