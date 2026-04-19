import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { Loader2, Save, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingBlock, TrainingWeek, TrainingDay, Exercise, ExerciseSet } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import {
    SQUAT_VARIANTS, BENCH_VARIANTS, DEADLIFT_VARIANTS,
    ACCESSORY_LIST, getPrimarySelectValue, getExerciseCategory, getVariantSubgroup
} from '../utils/exerciseLists';


interface EditBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (blockId: string, data: Partial<TrainingBlock>) => Promise<void>;
    onDelete: (blockId: string) => Promise<void>;
    block: TrainingBlock;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const EditBlockModal: React.FC<EditBlockModalProps> = ({ isOpen, onClose, onUpdate, onDelete, block }) => {
    const [title, setTitle] = useState(block.title);
    const [description, setDescription] = useState(block.description || '');
    const [startDate, setStartDate] = useState(block.startDate || '');
    const [weeks, setWeeks] = useState<TrainingWeek[]>(block.weeks);
    const [loading, setLoading] = useState(false);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        setTitle(block.title);
        setDescription(block.description || '');
        setStartDate(block.startDate || '');
        setWeeks(JSON.parse(JSON.stringify(block.weeks)));
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
            await onUpdate(block.id, { title, description: description || undefined, startDate, weeks });
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

    const addWeek = () => {
        const lastWeek = weeks[weeks.length - 1];
        // Clonar la última semana con nuevos IDs
        const newWeek: TrainingWeek = {
            id: generateId(),
            blockId: block.id,
            weekNumber: weeks.length + 1,
            days: lastWeek.days.map(day => ({
                ...day,
                id: generateId(),
                weekId: '',
                isCompleted: false,
                athleteNotes: undefined,
                exercises: day.exercises.map(ex => ({
                    ...ex,
                    id: generateId(),
                    dayId: '',
                    sets: ex.sets.map(set => ({
                        ...set,
                        id: generateId(),
                        exerciseId: '',
                        // Mantener prescripción (targetReps, targetRpe, suggestedWeight)
                        // pero limpiar datos reales rellenados
                        weight: undefined,
                        rpe: undefined,
                        estimated1rm: undefined,
                        isCompleted: false
                    }))
                }))
            }))
        };
        setWeeks([...weeks, newWeek]);
        setSelectedWeekIndex(weeks.length);
        setSelectedDayIndex(0);
    };

    const removeWeek = (weekIndex: number) => {
        if (weeks.length <= 1) return;
        const updatedWeeks = weeks.filter((_, i) => i !== weekIndex);
        updatedWeeks.forEach((w, i) => w.weekNumber = i + 1);
        setWeeks(updatedWeeks);
        setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1));
        setSelectedDayIndex(0);
    };

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

    const updateDayDescription = (desc: string) => {
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days[selectedDayIndex].description = desc || undefined;
        setWeeks(updatedWeeks);
    };

    const removeDay = (dayIndex: number) => {
        if (currentWeek.days.length <= 1) return;
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days.splice(dayIndex, 1);
        setWeeks(updatedWeeks);
        setSelectedDayIndex(Math.max(0, selectedDayIndex - 1));
    };

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
                <div className="flex items-start justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">Editar Bloque</h2>
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

                                <div className="space-y-3">
                                    {currentDay.exercises.map((exercise, exIndex) => (
                                        <Card key={exercise.id} className="border-slate-700 bg-slate-800/50">
                                            <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                                                    {/* --- Selector principal --- */}
                                                    <select
                                                        value={getPrimarySelectValue(exercise.name)}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'Comp SQ') updateExercise(exIndex, 'name', 'Comp SQ');
                                                            else if (val === 'Comp BP') updateExercise(exIndex, 'name', 'Comp BP');
                                                            else if (val === 'Comp DL') updateExercise(exIndex, 'name', 'Comp DL');
                                                            else if (val === 'variant') updateExercise(exIndex, 'name', SQUAT_VARIANTS[0]);
                                                            else if (val === 'accessory') updateExercise(exIndex, 'name', ACCESSORY_LIST[0]);
                                                            else updateExercise(exIndex, 'name', '');
                                                        }}
                                                        className="h-9 px-2 sm:px-3 rounded-md bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-blue-500 outline-none"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Comp SQ">Sentadilla (Comp)</option>
                                                        <option value="Comp BP">Banca (Comp)</option>
                                                        <option value="Comp DL">Peso Muerto (Comp)</option>
                                                        <option value="variant">Variantes</option>
                                                        <option value="accessory">Accesorios</option>
                                                    </select>

                                                    {/* --- Segundo selector: Variantes --- */}
                                                    {getPrimarySelectValue(exercise.name) === 'variant' && (() => {
                                                        const subgroup = getVariantSubgroup('variant', exercise.name);
                                                        return (
                                                            <>
                                                                <select
                                                                    value={subgroup}
                                                                    onChange={(e) => {
                                                                        const sg = e.target.value;
                                                                        if (sg === 'sq') updateExercise(exIndex, 'name', SQUAT_VARIANTS[0]);
                                                                        else if (sg === 'bp') updateExercise(exIndex, 'name', BENCH_VARIANTS[0]);
                                                                        else updateExercise(exIndex, 'name', DEADLIFT_VARIANTS[0]);
                                                                    }}
                                                                    className="h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none"
                                                                >
                                                                    <option value="sq">Squat</option>
                                                                    <option value="bp">Bench Press</option>
                                                                    <option value="dl">Deadlift</option>
                                                                </select>
                                                                <select
                                                                    value={exercise.name}
                                                                    onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                                                                    className="h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none flex-1"
                                                                >
                                                                    {(subgroup === 'sq' ? SQUAT_VARIANTS : subgroup === 'bp' ? BENCH_VARIANTS : DEADLIFT_VARIANTS)
                                                                        .map(v => <option key={v} value={v}>{v}</option>)}
                                                                </select>
                                                            </>
                                                        );
                                                    })()}

                                                    {/* --- Segundo selector: Accesorios --- */}
                                                    {getPrimarySelectValue(exercise.name) === 'accessory' && (
                                                        <>
                                                            <select
                                                                value={getExerciseCategory(exercise.name) === 'accessory_other' ? '__other__' : exercise.name}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '__other__') {
                                                                        updateExercise(exIndex, 'name', '');
                                                                    } else {
                                                                        updateExercise(exIndex, 'name', e.target.value);
                                                                    }
                                                                }}
                                                                className="h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none flex-1"
                                                            >
                                                                {ACCESSORY_LIST.filter(a => a !== 'Otros').map(a => (
                                                                    <option key={a} value={a}>{a}</option>
                                                                ))}
                                                                <option value="__other__">Otro...</option>
                                                            </select>
                                                            {getExerciseCategory(exercise.name) === 'accessory_other' && (
                                                                <Input
                                                                    placeholder="Escribe el accesorio"
                                                                    value={exercise.name}
                                                                    onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                                                                    className="flex-1 text-xs sm:text-sm"
                                                                />
                                                            )}
                                                        </>
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

                                                <div className="space-y-3">
                                                    {/* Desktop: Grid compacto */}
                                                    <div className="hidden sm:block space-y-2">
                                                        {/* Header con labels */}
                                                        <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center px-2 py-1">
                                                            <div className="text-xs text-slate-500 uppercase font-medium">#</div>
                                                            <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Kg (sug.)</label>
                                                            <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Reps</label>
                                                            <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">RPE</label>
                                                            <div></div>
                                                        </div>
                                                        {/* Filas de inputs */}
                                                        {exercise.sets.map((set, setIndex) => (
                                                            <div key={set.id} className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center bg-slate-950/50 p-2 rounded-md">
                                                                <div className="flex items-center justify-center text-slate-500 text-xs font-mono">{setIndex + 1}</div>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="80"
                                                                    min="0"
                                                                    step="0.5"
                                                                    value={set.suggestedWeight || ''}
                                                                    onChange={(e) => updateSet(exIndex, setIndex, 'suggestedWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                    className="h-10 text-sm"
                                                                />

                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="8"
                                                                    value={set.targetReps || ''}
                                                                    onChange={(e) => updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                                                                    className="h-10 text-sm"
                                                                    autoComplete="off"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    inputMode="decimal"
                                                                    placeholder="7"
                                                                    min="1"
                                                                    step="0.5"
                                                                    max="10"
                                                                    value={set.targetRpe || ''}
                                                                    onChange={(e) => {
                                                                        const val = parseFloat(e.target.value);
                                                                        if (!isNaN(val) && val >= 1 && val <= 10) {
                                                                            updateSet(exIndex, setIndex, 'targetRpe', val);
                                                                        } else if (e.target.value === '') {
                                                                            updateSet(exIndex, setIndex, 'targetRpe', undefined);
                                                                        }
                                                                    }}
                                                                    className="h-10 text-sm"
                                                                    autoComplete="off"
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

                                                                {/* Grid de inputs - 3 columnas en móvil */}
                                                                <div className="grid grid-cols-3 gap-2.5">

                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Kg</label>
                                                                        <Input
                                                                            type="number"
                                                                            inputMode="decimal"
                                                                            placeholder="80"
                                                                            min="0"
                                                                            step="0.5"
                                                                            value={set.suggestedWeight || ''}
                                                                            onChange={(e) => updateSet(exIndex, setIndex, 'suggestedWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-blue-500 focus:bg-slate-900 pointer-events-auto"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Repeticiones</label>
                                                                        <Input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            placeholder="8"
                                                                            value={set.targetReps || ''}
                                                                            onChange={(e) => updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-blue-500 focus:bg-slate-900 pointer-events-auto"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">RPE</label>
                                                                        <Input
                                                                            type="number"
                                                                            inputMode="decimal"
                                                                            placeholder="7"
                                                                            min="1"
                                                                            step="0.5"
                                                                            max="10"
                                                                            value={set.targetRpe || ''}
                                                                            onChange={(e) => {
                                                                                const val = parseFloat(e.target.value);
                                                                                if (!isNaN(val) && val >= 1 && val <= 10) {
                                                                                    updateSet(exIndex, setIndex, 'targetRpe', val);
                                                                                } else if (e.target.value === '') {
                                                                                    updateSet(exIndex, setIndex, 'targetRpe', undefined);
                                                                                }
                                                                            }}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-blue-500 focus:bg-slate-900 pointer-events-auto"
                                                                            autoComplete="off"
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

                    {/* Pie del modal */}
                    <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-slate-950/50">
                        <Button type="button" variant="danger" onClick={handleDeleteClick} disabled={loading} className="gap-2 text-xs sm:text-sm h-9 sm:h-10">
                            <Trash2 size={16} /> Eliminar
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10 flex-1 sm:flex-none">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading || !title} className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5 flex-1 sm:flex-none">
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
        </div>
    );
};