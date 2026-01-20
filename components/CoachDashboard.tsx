import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from './ui';
import { Users, Plus, Trash2, TrendingUp, Calendar, User, ChevronRight, Edit2 } from 'lucide-react';
import { TrainingService } from '../services/mockService';
import { useAuth } from '../contexts/AuthContext';
import { ProgressData, TrainingBlock } from '../types';
import { ProgressCharts } from './Progress';
import { CreateBlockModal } from './CreateBlockModal';
import { EditBlockModal } from './EditBlockModal';
import { ConfirmDialog } from './ConfirmDialog';

// Interfaz para representar un atleta en la lista del entrenador
interface Athlete {
    _id: string;
    name: string;
    email: string;
}

export const CoachDashboard: React.FC = () => {
    const { token } = useAuth();
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
    const [athleteProgress, setAthleteProgress] = useState<ProgressData[]>([]);
    const [athleteBlocks, setAthleteBlocks] = useState<TrainingBlock[]>([]);
    const [newAthleteEmail, setNewAthleteEmail] = useState('');
    const [isAddingAthlete, setIsAddingAthlete] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'progress' | 'blocks'>('list');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Estado para editar un bloque existente
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TrainingBlock | null>(null);

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Cargar la lista de atletas del entrenador al montar el componente
    useEffect(() => {
        const loadAthletes = async () => {
            if (token) {
                const data = await TrainingService.getAthletes(token);
                setAthletes(data);
                setLoading(false);
            }
        };
        loadAthletes();
    }, [token]);

    // Cargar datos del atleta seleccionado (progreso y bloques)
    useEffect(() => {
        const loadAthleteData = async () => {
            if (token && selectedAthlete) {
                const [progress, blocks] = await Promise.all([
                    TrainingService.getAthleteProgress(token, selectedAthlete._id),
                    TrainingService.getAthleteBlocks(token, selectedAthlete._id)
                ]);
                setAthleteProgress(progress);
                setAthleteBlocks(blocks);
            }
        };
        loadAthleteData();
    }, [token, selectedAthlete]);

    const handleAddAthlete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !newAthleteEmail.trim()) return;

        setIsAddingAthlete(true);
        setError('');
        setSuccessMessage('');

        try {
            await TrainingService.addAthlete(token, newAthleteEmail);
            setSuccessMessage('Invitación enviada correctamente al atleta');
            setNewAthleteEmail('');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setError(err.message || 'Error al enviar invitación');
        } finally {
            setIsAddingAthlete(false);
        }
    };

    const handleRemoveAthlete = (athleteId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Atleta',
            message: '¿Estás seguro de que quieres eliminar a este atleta de tu lista? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                if (!token) return;
                const success = await TrainingService.removeAthlete(token, athleteId);
                if (success) {
                    setAthletes(prev => prev.filter(a => a._id !== athleteId));
                    if (selectedAthlete?._id === athleteId) {
                        setSelectedAthlete(null);
                        setView('list');
                    }
                }
            }
        });
    };

    const handleCreateBlock = async (blockData: Partial<TrainingBlock>) => {
        if (!token || !selectedAthlete) return;

        try {
            const newBlock = await TrainingService.createBlockForAthlete(token, selectedAthlete._id, blockData);
            if (newBlock) {
                setAthleteBlocks([...athleteBlocks, newBlock]);
            }
        } catch (error) {
            console.error('Error creating block for athlete', error);
        }
    };

    const handleUpdateBlock = async (blockId: string, data: Partial<TrainingBlock>) => {
        if (!token || !selectedAthlete) return;
        try {
            const success = await TrainingService.updateBlock(token, blockId, data);
            if (success) {
                // Refrescar la lista de bloques después de actualizar
                const blocks = await TrainingService.getAthleteBlocks(token, selectedAthlete._id);
                setAthleteBlocks(blocks);
            }
        } catch (error) {
            console.error('Error updating block', error);
        }
    };

    const handleDeleteBlock = async (blockId: string) => {
        if (!token) return;
        try {
            const success = await TrainingService.deleteBlock(token, blockId);
            if (success) {
                setAthleteBlocks(prev => prev.filter(b => b.id !== blockId));
            }
        } catch (error) {
            console.error('Error deleting block', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Vista de detalle del atleta (progreso o bloques)
    if (selectedAthlete && view !== 'list') {
        return (
            <div className="space-y-6">
                {/* Cabecera con botón de volver y nombre del atleta */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => { setSelectedAthlete(null); setView('list'); }}>
                            ← Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{selectedAthlete.name}</h1>
                            <p className="text-slate-400">{selectedAthlete.email}</p>
                        </div>
                    </div>
                </div>

                {/* Modal para crear un nuevo bloque */}
                <CreateBlockModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateBlock}
                    targetAthleteName={selectedAthlete.name}
                />

                {/* Modal para editar un bloque existente */}
                {editingBlock && (
                    <EditBlockModal
                        isOpen={isEditModalOpen}
                        onClose={() => { setIsEditModalOpen(false); setEditingBlock(null); }}
                        onUpdate={handleUpdateBlock}
                        onDelete={handleDeleteBlock}
                        block={editingBlock}
                    />
                )}

                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                />

                {/* Pestañas para cambiar entre vista de progreso y bloques */}
                <div className="flex gap-2">
                    <Button
                        variant={view === 'progress' ? 'primary' : 'outline'}
                        onClick={() => setView('progress')}
                    >
                        <TrendingUp size={18} className="mr-2" /> Progreso
                    </Button>
                    <Button
                        variant={view === 'blocks' ? 'primary' : 'outline'}
                        onClick={() => setView('blocks')}
                    >
                        <Calendar size={18} className="mr-2" /> Bloques ({athleteBlocks.length})
                    </Button>
                    {view === 'blocks' && (
                        <Button
                            className="ml-auto bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={18} className="mr-2" /> Asignar Bloque
                        </Button>
                    )}
                </div>

                {/* Contenido según la pestaña seleccionada */}
                {view === 'progress' && (
                    <ProgressCharts data={athleteProgress} />
                )}

                {view === 'blocks' && (
                    <div className="space-y-4">
                        {athleteBlocks.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="p-8 text-center">
                                    <Calendar size={48} className="mx-auto text-slate-500 mb-4" />
                                    <p className="text-slate-400">Este atleta no tiene bloques asignados</p>
                                </CardContent>
                            </Card>
                        ) : (
                            athleteBlocks.map(block => (
                                <Card key={block.id} className="hover:border-blue-500/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{block.title}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {block.weeks.length} semanas · {block.source === 'assigned' ? 'Asignado' : 'Personal'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingBlock(block); setIsEditModalOpen(true); }}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Vista de lista de atletas (pantalla principal del panel de entrenador)
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Panel de Entrenador</h1>
                <p className="text-slate-400">Gestiona a tus atletas y su progreso</p>
            </div>

            {/* Formulario para invitar atletas por email */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus size={20} /> Invitar Atleta
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddAthlete} className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="Email del atleta"
                            value={newAthleteEmail}
                            onChange={(e) => setNewAthleteEmail(e.target.value)}
                            className="flex-1"
                            required
                        />
                        <Button type="submit" disabled={isAddingAthlete}>
                            {isAddingAthlete ? 'Enviando...' : 'Invitar'}
                        </Button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
                </CardContent>
            </Card>

            {/* Grid de atletas con tarjetas clickeables */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users size={20} /> Mis Atletas ({athletes.length})
                </h2>

                {athletes.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                            <Users size={48} className="mx-auto text-slate-500 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Sin atletas activos</h3>
                            <p className="text-slate-400">Invita atletas usando su email. Aparecerán aquí cuando acepten.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.map(athlete => (
                            <Card
                                key={athlete._id}
                                className="hover:border-blue-500/50 transition-colors cursor-pointer"
                                onClick={() => { setSelectedAthlete(athlete); setView('progress'); }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                                <User size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{athlete.name}</h3>
                                                <p className="text-sm text-slate-400">{athlete.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveAthlete(athlete._id); }}
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </div>
    );
};
