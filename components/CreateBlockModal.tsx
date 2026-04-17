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

// Genera IDs únicos para los elementos del bloque
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Crea una estructura de semana por defecto con un día inicial
const createDefaultWeek = (weekNumber: number): TrainingWeek => ({
    id: generateId(),
    blockId: '',
    weekNumber,
    days: [createDefaultDay(1)]
});

// Crea una estructura de día por defecto sin ejercicios
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
    const [description, setDescription] = useState('');
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
        setDescription('');
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
                description: description || undefined,
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


    // Gestión de semanas: añadir y eliminar
    const addWeek = () => {
        const newWeek = createDefaultWeek(weeks.length + 1);
        setWeeks([...weeks, newWeek]);
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

    const updateDayDescription = (description: string) => {
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].description = description || undefined;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden my-2 sm:my-4">
                {/* Cabecera del modal - Responsiva */}
                <div className="flex items-start justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-white truncate">Nuevo Bloque</h2>
                        {targetAthleteName && (
                            <p className="text-xs sm:text-sm text-blue-400 truncate">Para: {targetAthleteName}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 shrink-0 ml-2">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh] sm:max-h-[80vh]">
                    {/* Información básica del bloque */}
                    <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-300">Nombre</label>
                                <Input
                                    placeholder="Ej: Fuerza"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-300">Fecha Inicio</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        {/* Descripción solo en desktop */}
                        <div className="hidden sm:block space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-300">Descripción (opcional)</label>
                            <textarea
                                placeholder="Objetivo, fase, notas..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-100 text-xs sm:text-sm focus:border-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Navegación por semanas y días - Super compacto en móvil */}
                    <div className="p-2 sm:p-4 border-b border-slate-800 bg-slate-950/50 space-y-2 sm:space-y-3">
                        {/* Selector de semanas */}
                        <div className="space-y-1 sm:space-y-2">
                            <div className="hidden sm:flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-slate-400">Semana {selectedWeekIndex + 1} de {weeks.length}</span>
                                <div className="flex gap-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={addWeek} className="h-8 px-2 text-xs">
                                        <Plus size={14} />
                                    </Button>
                                    {weeks.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => removeWeek(selectedWeekIndex)} className="h-8 px-2 text-xs">
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {/* Móvil: botones más pequeños */}
                            <div className="flex gap-0.5 overflow-x-auto pb-1 sm:gap-1">
                                {weeks.map((week, i) => (
                                    <button
                                        key={week.id}
                                        type="button"
                                        onClick={() => { setSelectedWeekIndex(i); setSelectedDayIndex(0); }}
                                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${selectedWeekIndex === i
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        S{week.weekNumber}
                                    </button>
                                ))}
                                {/* Botones add/remove en móvil */}
                                <div className="sm:hidden flex gap-0.5 ml-auto flex-shrink-0">
                                    <Button type="button" variant="ghost" size="sm" onClick={addWeek} className="h-7 px-1.5 text-xs">
                                        <Plus size={12} />
                                    </Button>
                                    {weeks.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => removeWeek(selectedWeekIndex)} className="h-7 px-1.5 text-xs">
                                            <Trash2 size={12} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Selector de días */}
                        <div className="space-y-1 sm:space-y-2">
                            <div className="hidden sm:flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-slate-400">Día {selectedDayIndex + 1} de {currentWeek?.days.length || 0}</span>
                                <Button type="button" variant="ghost" size="sm" onClick={addDay} className="h-8 px-2 text-xs">
                                    <Plus size={14} />
                                </Button>
                            </div>
                            <div className="flex gap-0.5 overflow-x-auto pb-1 sm:gap-1">
                                {currentWeek?.days.map((day, i) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => setSelectedDayIndex(i)}
                                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors truncate max-w-[80px] sm:max-w-none ${selectedDayIndex === i
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {day.dayName}
                                    </button>
                                ))}
                                {/* Botón add/remove en móvil */}
                                <Button type="button" variant="ghost" size="sm" onClick={addDay} className="sm:hidden h-7 px-1.5 text-xs flex-shrink-0">
                                    <Plus size={12} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Editor del día seleccionado */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                        {currentDay && (
                            <>
                                {/* Nombre del día editable */}
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-400 block mb-1">Nombre del día</label>
                                        <Input
                                            placeholder="Ej: Día 1"
                                            value={currentDay.dayName}
                                            onChange={(e) => updateDayName(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                    {currentWeek.days.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeDay(selectedDayIndex)}
                                            className="h-9 px-2"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>

                                {/* Descripción del día */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Descripción (opcional)</label>
                                    <textarea
                                        placeholder="Ej: Volumen, técnica..."
                                        value={currentDay.description || ''}
                                        onChange={(e) => updateDayDescription(e.target.value)}
                                        rows={2}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-100 text-xs sm:text-sm focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Lista de ejercicios del día */}
                                <div className="space-y-3">
                                    {currentDay.exercises.length === 0 && (
                                        <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg bg-slate-950/30">
                                            <Plus size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs sm:text-sm">Sin ejercicios aún</p>
                                        </div>
                                    )}

                                    {currentDay.exercises.map((exercise, exIndex) => (
                                        <Card key={exercise.id} className="border-slate-700 bg-slate-800/50">
                                            <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                                {/* Cabecera del ejercicio */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                    <select
                                                        value={['Comp SQ', 'Comp BP', 'Comp DL'].includes(exercise.name) ? exercise.name : 'custom'}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'custom') {
                                                                updateExercise(exIndex, 'name', '');
                                                            } else {
                                                                updateExercise(exIndex, 'name', e.target.value);
                                                            }
                                                        }}
                                                        className="h-9 px-2 sm:px-3 rounded-md bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-blue-500 outline-none flex-1 sm:flex-none"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Comp SQ">Sentadilla</option>
                                                        <option value="Comp BP">Banca</option>
                                                        <option value="Comp DL">Peso Muerto</option>
                                                        <option value="custom">Accesorio</option>
                                                    </select>
                                                    {!['Comp SQ', 'Comp BP', 'Comp DL'].includes(exercise.name) && (
                                                        <Input
                                                            placeholder="Nombre"
                                                            value={exercise.name}
                                                            onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                                                            className="flex-1 text-xs sm:text-sm"
                                                        />
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => removeExercise(exIndex)}
                                                        className="h-9 px-2 shrink-0"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>

                                                {/* Series del ejercicio - Responsive */}
                                                <div className="space-y-3">
                                                    {/* Header en desktop, oculto en móvil */}
                                                    <div className="hidden sm:grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs text-slate-500 uppercase px-2 mb-2 font-medium">
                                                        <span>#</span>
                                                        <span>Reps</span>
                                                        <span>RPE</span>
                                                        <span></span>
                                                    </div>
                                                    
                                                    {/* Desktop: Grid compacto */}
                                                    <div className="hidden sm:space-y-2">
                                                        {exercise.sets.map((set, setIndex) => (
                                                            <div key={set.id} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center bg-slate-950/50 p-2 rounded-md">
                                                                <div className="flex items-center justify-center text-slate-500 text-xs font-mono">{setIndex + 1}</div>
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
                                                                    className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Móvil: Cards grandes y visuales */}
                                                    <div className="sm:hidden space-y-2.5">
                                                        {exercise.sets.map((set, setIndex) => (
                                                            <div key={set.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 space-y-2.5 transform transition-all hover:border-blue-500/50">
                                                                {/* Header de la serie */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold border border-blue-500/30">
                                                                            {setIndex + 1}
                                                                        </div>
                                                                        <span className="text-slate-300 font-medium">Serie {setIndex + 1}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSet(exIndex, setIndex)}
                                                                        disabled={exercise.sets.length <= 1}
                                                                        className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 hover:bg-red-900/20 rounded transition-colors"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>

                                                                {/* Grid de inputs - 2 columnas en móvil */}
                                                                <div className="grid grid-cols-2 gap-2.5">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Repeticiones</label>
                                                                        <Input
                                                                            placeholder="8"
                                                                            value={set.targetReps || ''}
                                                                            onChange={(e) => updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-blue-500 focus:bg-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">RPE</label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="7"
                                                                            min={1}
                                                                            max={10}
                                                                            value={set.targetRpe || ''}
                                                                            onChange={(e) => updateSet(exIndex, setIndex, 'targetRpe', parseInt(e.target.value) || undefined)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-blue-500 focus:bg-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Botón añadir serie */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addSet(exIndex)}
                                                        className="w-full text-xs sm:text-sm h-9 sm:h-8 text-slate-400 hover:text-slate-300 bg-slate-950/30 hover:bg-slate-900/50"
                                                    >
                                                        <Plus size={16} className="mr-1.5" /> Añadir Serie
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addExercise}
                                        className="w-full text-xs sm:text-sm h-9"
                                    >
                                        <Plus size={16} className="mr-1.5" /> Ejercicio
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pie del modal - Responsive */}
                    <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2 bg-slate-950/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !title} className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
