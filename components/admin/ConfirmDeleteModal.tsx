import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <AlertCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Confirmar Eliminación</h3>
                </div>
                <p className="text-slate-50 mb-6">
                    ¿Estás seguro de que deseas eliminar este usuario? Esta acción eliminará
                    todos sus datos (bloques, progreso, etc.) y <strong>no se puede deshacer</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};
