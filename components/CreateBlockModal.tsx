import React, { useState } from 'react';
import { Button, Input, Card, CardContent } from './ui';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { TrainingBlock, TrainingWeek, TrainingDay, Exercise, ExerciseSet } from '../types';

interface CreateBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (blockData: Partial<TrainingBlock>) => Promise<void>;
    targetAthleteName?: string;
}

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a default week structure
const createDefaultWeek = (weekNumber: number): TrainingWeek => ({
    id: generateId(),
    blockId: '',
    weekNumber,
    days: [createDefaultDay(1)]
});

// Create a default day structure  
const createDefaultDay = (dayNum: number): TrainingDay => ({
    id: generateId(),
    weekId: '',
    dayName: `Día ${dayNum}`,
    isCompleted: false,
    exercises: []
});

export const CreateBlockModal: React.FC<CreateBlockModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    targetAthleteName
}) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [weeks, setWeeks] = useState<TrainingWeek[]>([createDefaultWeek(1)]);
    const [loading, setLoading] = useState(false);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    if (!isOpen) return null;

    const currentWeek = weeks[selectedWeekIndex];
    const currentDay = currentWeek?.days[selectedDayIndex];

    const resetForm = () => {
        setTitle('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setWeeks([createDefaultWeek(1)]);
        setSelectedWeekIndex(0);
        setSelectedDayIndex(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onCreate({
                title,
                startDate,
                source: targetAthleteName ? 'assigned' : 'personal',
                weeks
            });
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error creating block", error);
        } finally {
            setLoading(false);
        }
    };


    // Week management
    const addWeek = () => {
        const newWeek = createDefaultWeek(weeks.length + 1);
        setWeeks([...weeks, newWeek]);
    };

    const removeWeek = (weekIndex: number) => {
        if (weeks.length <= 1) return;
        const updatedWeeks = weeks.filter((_, i) => i !== weekIndex);
        // Renumber weeks
        updatedWeeks.forEach((w, i) => w.weekNumber = i + 1);
        setWeeks(updatedWeeks);
        setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1));
        setSelectedDayIndex(0);
    };

    // Day management
    const addDay = () => {
        const newDay = createDefaultDay(currentWeek.days.length + 1);
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

    // Exercise management
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

    // Set management
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
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-white">Nuevo Bloque de Entrenamiento</h2>
                        {targetAthleteName && (
                            <p className="text-sm text-blue-400">Asignando a: {targetAthleteName}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
                    {/* Block Info */}
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
                                required
                            />
                        </div>
                    </div>

                    {/* Week/Day Navigation */}
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        {/* Weeks */}
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

                        {/* Days */}
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

                    {/* Day Editor */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentDay && (
                            <>
                                {/* Day Name */}
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

                                {/* Exercises */}
                                <div className="space-y-4">
                                    {currentDay.exercises.length === 0 && (
                                        <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                                            No hay ejercicios. Añade uno para comenzar.
                                        </div>
                                    )}

                                    {currentDay.exercises.map((exercise, exIndex) => (
                                        <Card key={exercise.id} className="border-slate-700 bg-slate-800/50">
                                            <CardContent className="p-4 space-y-3">
                                                {/* Exercise Header */}
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

                                                {/* Sets */}
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

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !title}>
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
                            Crear Bloque
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
