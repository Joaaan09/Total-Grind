import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { Loader2, Save, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingBlock, TrainingWeek, TrainingDay, Exercise, ExerciseSet } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface EditBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (blockId: string, data: Partial<TrainingBlock>) => Promise<void>;
    onDelete: (blockId: string) => Promise<void>;
    block: TrainingBlock;
}

// Genera IDs únicos para los elementos del bloque
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const EditBlockModal: React.FC<EditBlockModalProps> = ({ isOpen, onClose, onUpdate, onDelete, block }) => {
    const [title, setTitle] = useState(block.title);
    const [startDate, setStartDate] = useState(block.startDate || '');
    const [weeks, setWeeks] = useState<TrainingWeek[]>(block.weeks);
    const [loading, setLoading] = useState(false);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Reiniciar el formulario cuando cambia el bloque (clonar datos)
    useEffect(() => {
        setTitle(block.title);
        setStartDate(block.startDate || '');
        setWeeks(JSON.parse(JSON.stringify(block.weeks))); // Clonar profundamente
        setSelectedWeekIndex(0);
        setSelectedDayIndex(0);
    }, [block]);

    if (!isOpen) return null;

    const currentWeek = weeks[selectedWeekIndex];
    const currentDay = currentWeek?.days[selectedDayIndex];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(block.id, { title, startDate, weeks });
            onClose();
        } catch (error) {
            console.error("Error updating", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setConfirmOpen(true);
    };

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

    // Gestión de semanas: añadir y eliminar
    const addWeek = () => {
        const newWeek: TrainingWeek = {
            id: generateId(),
            blockId: block.id,
            weekNumber: weeks.length + 1,
            days: [{
                id: generateId(),
                weekId: '',
                dayName: 'Día 1',
                isCompleted: false,
                exercises: []
            }]
        };
        setWeeks([...weeks, newWeek]);
        setSelectedWeekIndex(weeks.length);
        setSelectedDayIndex(0);
    };

    const removeWeek = (weekIndex: number) => {
        if (weeks.length <= 1) return;
        const updatedWeeks = weeks.filter((_, i) => i !== weekIndex);
        // Renumerar semanas después de eliminar
        updatedWeeks.forEach((w, i) => w.weekNumber = i + 1);
        setWeeks(updatedWeeks);
        setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1));
        setSelectedDayIndex(0);
    };

    // Gestión de días: añadir, actualizar nombre y eliminar
    const addDay = () => {
        const newDay: TrainingDay = {
            id: generateId(),
            weekId: currentWeek.id,
            dayName: `Día ${currentWeek.days.length + 1}`,
            isCompleted: false,
            exercises: []
        };
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days.push(newDay);
        setWeeks(updatedWeeks);
        setSelectedDayIndex(currentWeek.days.length);
    };

    const updateDayName = (name: string) => {
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].dayName = name;
        setWeeks(updatedWeeks);
    };

    const removeDay = (dayIndex: number) => {
        if (currentWeek.days.length <= 1) return;
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days.splice(dayIndex, 1);
        setWeeks(updatedWeeks);
        setSelectedDayIndex(Math.max(0, selectedDayIndex - 1));
    };

    // Gestión de ejercicios: añadir, actualizar y eliminar
    const addExercise = () => {
        const newExercise: Exercise = {
            id: generateId(),
            dayId: currentDay.id,
            name: '',
            sets: [{
                id: generateId(),
                exerciseId: '',
                targetReps: '8',
                targetRpe: 7,
                isCompleted: false
            }],
            notes: ''
        };
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises.push(newExercise);
        setWeeks(updatedWeeks);
    };

    const updateExercise = (exerciseIndex: number, field: keyof Exercise, value: any) => {
        const updatedWeeks = [...weeks];
        (updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises[exerciseIndex] as any)[field] = value;
        setWeeks(updatedWeeks);
    };

    const removeExercise = (exerciseIndex: number) => {
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises.splice(exerciseIndex, 1);
        setWeeks(updatedWeeks);
    };

    // Gestión de series: añadir, actualizar y eliminar
    const addSet = (exerciseIndex: number) => {
        const exercise = currentDay.exercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: ExerciseSet = {
            id: generateId(),
            exerciseId: exercise.id,
            targetReps: lastSet?.targetReps || '8',
            targetRpe: lastSet?.targetRpe || 7,
            isCompleted: false
        };
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises[exerciseIndex].sets.push(newSet);
        setWeeks(updatedWeeks);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
        const updatedWeeks = [...weeks];
        (updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises[exerciseIndex].sets[setIndex] as any)[field] = value;
        setWeeks(updatedWeeks);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const exercise = currentDay.exercises[exerciseIndex];
        if (exercise.sets.length <= 1) return;
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
        setWeeks(updatedWeeks);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden my-4">
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Editar Bloque</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
                    {/* Información básica del bloque */}
                    <div className="p-4 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nombre del Bloque</label>
                            <Input
                                placeholder="Ej: Mesociclo de Fuerza"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Fecha Inicio</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Navegación por semanas y días */}
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        {/* Selector de semanas */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-slate-400 mr-2">Semana:</span>
                            <div className="flex gap-1 overflow-x-auto flex-1">
                                {weeks.map((week, i) => (
                                    <button
                                        key={week.id}
                                        type="button"
                                        onClick={() => { setSelectedWeekIndex(i); setSelectedDayIndex(0); }}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedWeekIndex === i
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {week.weekNumber}
                                    </button>
                                ))}
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={addWeek} className="shrink-0">
                                <Plus size={16} />
                            </Button>
                            {weeks.length > 1 && (
                                <Button type="button" variant="danger" size="sm" onClick={() => removeWeek(selectedWeekIndex)} className="shrink-0">
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>

                        {/* Selector de días */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 mr-2">Día:</span>
                            <div className="flex gap-1 overflow-x-auto flex-1">
                                {currentWeek?.days.map((day, i) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => setSelectedDayIndex(i)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors truncate max-w-[120px] ${selectedDayIndex === i
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {day.dayName}
                                    </button>
                                ))}
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={addDay} className="shrink-0">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Editor del día seleccionado */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentDay && (
                            <>
                                {/* Nombre del día editable */}
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Nombre del día"
                                        value={currentDay.dayName}
                                        onChange={(e) => updateDayName(e.target.value)}
                                        className="flex-1"
                                    />
                                    {currentWeek.days.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeDay(selectedDayIndex)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>

                                {/* Lista de ejercicios */}
                                <div className="space-y-4">
                                    {currentDay.exercises.map((exercise, exIndex) => (
                                        <Card key={exercise.id} className="border-slate-700 bg-slate-800/50">
                                            <CardContent className="p-4 space-y-3">
                                                {/* Cabecera del ejercicio */}
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={['Comp SQ', 'Comp BP', 'Comp DL'].includes(exercise.name) ? exercise.name : 'custom'}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'custom') {
                                                                updateExercise(exIndex, 'name', '');
                                                            } else {
                                                                updateExercise(exIndex, 'name', e.target.value);
                                                            }
                                                        }}
                                                        className="h-10 px-3 rounded-md bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Comp SQ">Comp SQ (Sentadilla)</option>
                                                        <option value="Comp BP">Comp BP (Banca)</option>
                                                        <option value="Comp DL">Comp DL (Peso Muerto)</option>
                                                        <option value="custom">Variante/Accesorio</option>
                                                    </select>
                                                    {!['Comp SQ', 'Comp BP', 'Comp DL'].includes(exercise.name) && (
                                                        <Input
                                                            placeholder="Nombre del accesorio"
                                                            value={exercise.name}
                                                            onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => removeExercise(exIndex)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>

                                                {/* Series del ejercicio */}
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs text-slate-500 uppercase px-1">
                                                        <span>#</span>
                                                        <span>Reps</span>
                                                        <span>RPE</span>
                                                        <span></span>
                                                    </div>
                                                    {exercise.sets.map((set, setIndex) => (
                                                        <div key={set.id} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center">
                                                            <span className="text-slate-500 text-sm text-center">{setIndex + 1}</span>
                                                            <Input
                                                                placeholder="8"
                                                                value={set.targetReps || ''}
                                                                onChange={(e) => updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                                                                className="h-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <Input
                                                                type="number"
                                                                placeholder="7"
                                                                min={1}
                                                                max={10}
                                                                value={set.targetRpe || ''}
                                                                onChange={(e) => updateSet(exIndex, setIndex, 'targetRpe', parseInt(e.target.value) || undefined)}
                                                                className="h-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSet(exIndex, setIndex)}
                                                                disabled={exercise.sets.length <= 1}
                                                                className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addSet(exIndex)}
                                                        className="w-full text-slate-400"
                                                    >
                                                        <Plus size={14} className="mr-1" /> Añadir Serie
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addExercise}
                                        className="w-full"
                                    >
                                        <Plus size={18} className="mr-2" /> Añadir Ejercicio
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pie del modal con botones de acción */}
                    <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <Button type="button" variant="danger" onClick={handleDeleteClick} disabled={loading} className="gap-2">
                            <Trash2 size={16} /> Eliminar Bloque
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading || !title}>
                                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                Guardar
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Bloque"
                message="¿Estás seguro de que quieres eliminar este bloque? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div >
    );
};
