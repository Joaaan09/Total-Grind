import React, { useState } from 'react';
import { Button } from './ui';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { TrainingBlock } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { useBlockEditor } from '../hooks/useBlockEditor';
import { SharedBlockModal } from './SharedBlockModal';

interface EditBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (blockId: string, data: Partial<TrainingBlock>) => Promise<void>;
    onDelete: (blockId: string) => Promise<void>;
    block: TrainingBlock;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({ isOpen, onClose, onUpdate, onDelete, block }) => {
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const editor = useBlockEditor({
        initialTitle: block.title,
        initialDescription: block.description || '',
        initialStartDate: block.startDate || '',
        initialWeeks: block.weeks
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(block.id, {
                title: editor.title,
                description: editor.description || undefined,
                startDate: editor.startDate,
                weeks: editor.weeks
            });
            onClose();
        } catch (error) {
            console.error("Error updating", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => setConfirmOpen(true);

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await onDelete(block.id);
            onClose();
        } catch (error) {
            console.error("Error deleting", error);
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    const footerActions = (
        <div className="flex w-full flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2">
            <Button type="button" variant="danger" onClick={handleDeleteClick} disabled={loading} className="gap-2 text-xs sm:text-sm h-9 sm:h-10">
                <Trash2 size={16} /> Eliminar
            </Button>
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10 flex-1 sm:flex-none">
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading || !editor.title} className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5 flex-1 sm:flex-none">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Guardar
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <SharedBlockModal
                title="Editar Bloque"
                editor={editor}
                onClose={onClose}
                onSubmit={handleSubmit}
                footerActions={footerActions}
                blockIdForNewWeek={block.id}
            />
            
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Bloque"
                message="¿Estás seguro de que quieres eliminar este bloque? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </>
    );
};