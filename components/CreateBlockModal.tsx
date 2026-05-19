import React, { useState } from 'react';
import { Button } from './ui';
import { Loader2, Plus } from 'lucide-react';
import { TrainingBlock } from '../types';
import { useBlockEditor } from '../hooks/useBlockEditor';
import { SharedBlockModal } from './SharedBlockModal';

interface CreateBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (blockData: Partial<TrainingBlock>) => Promise<void>;
    targetAthleteName?: string;
}

export const CreateBlockModal: React.FC<CreateBlockModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    targetAthleteName
}) => {
    const [loading, setLoading] = useState(false);
    const editor = useBlockEditor();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreate({
                title: editor.title,
                description: editor.description || undefined,
                startDate: editor.startDate,
                source: targetAthleteName ? 'assigned' : 'personal',
                weeks: editor.weeks
            });
            editor.resetForm();
            onClose();
        } catch (error) {
            console.error("Error creating block", error);
        } finally {
            setLoading(false);
        }
    };

    const footerActions = (
        <div className="flex w-full flex-col-reverse sm:flex-row justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10">
                Cancelar
            </Button>
            <Button type="submit" disabled={loading || !editor.title} className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Crear
            </Button>
        </div>
    );

    return (
        <SharedBlockModal
            title="Nuevo Bloque"
            subtitle={targetAthleteName ? `Para: ${targetAthleteName}` : undefined}
            editor={editor}
            onClose={onClose}
            onSubmit={handleSubmit}
            footerActions={footerActions}
        />
    );
};
