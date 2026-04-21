import React, { useState } from 'react';
import { Button, Input, Card, CardContent } from './ui';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { TrainingBlock } from '../types';
import { useBlockEditor } from '../hooks/useBlockEditor';
import {
    SQUAT_VARIANTS, BENCH_VARIANTS, DEADLIFT_VARIANTS,
    ACCESSORY_LIST, getPrimarySelectValue, getExerciseCategory, getVariantSubgroup
} from '../utils/exerciseLists';

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

    const currentWeek = editor.currentWeek;
    const currentDay = editor.currentDay;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Cabecera del modal - Responsiva */}
                <div className="flex-none flex items-start justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-50 truncate">Nuevo Bloque</h2>
                        {targetAthleteName && (
                            <p className="text-xs sm:text-sm text-brandRed-500 truncate">Para: {targetAthleteName}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-50 p-1 shrink-0 ml-2">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* Zona scrollable: todo el contenido del formulario */}
                    <div className="flex-1 overflow-y-auto">
                    {/* Información básica del bloque */}
                    <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-50">Nombre</label>
                                <Input
                                    placeholder="Ej: Fuerza"
                                    value={editor.title}
                                    onChange={(e) => editor.setTitle(e.target.value)}
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-50">Fecha Inicio</label>
                                <Input
                                    type="date"
                                    value={editor.startDate}
                                    onChange={(e) => editor.setStartDate(e.target.value)}
                                    required
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        {/* Descripción solo en desktop */}
                        <div className="hidden sm:block space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-50">Descripción (opcional)</label>
                            <textarea
                                placeholder="Objetivo, fase, notas..."
                                value={editor.description}
                                onChange={(e) => editor.setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Navegación por semanas y días - Super compacto en móvil */}
                    <div className="p-2 sm:p-4 border-b border-slate-800 bg-slate-950/50 space-y-2 sm:space-y-3">
                        {/* Selector de semanas */}
                        <div className="space-y-1 sm:space-y-2">
                            <div className="hidden sm:flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-slate-400">Semana {editor.selectedWeekIndex + 1} de {editor.weeks.length}</span>
                                <div className="flex gap-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.addWeek('')} className="h-8 px-2 text-xs">
                                        <Plus size={14} />
                                    </Button>
                                    {editor.weeks.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => editor.removeWeek(editor.selectedWeekIndex)} className="h-8 px-2 text-xs">
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {/* Móvil: botones más pequeños */}
                            <div className="flex gap-0.5 overflow-x-auto pb-1 sm:gap-1">
                                {editor.weeks.map((week, i) => (
                                    <button
                                        key={week.id}
                                        type="button"
                                        onClick={() => { editor.setSelectedWeekIndex(i); editor.setSelectedDayIndex(0); }}
                                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${editor.selectedWeekIndex === i
                                            ? 'bg-brandRed-600 text-slate-50'
                                            : 'bg-slate-800 text-slate-400 hover:text-slate-50'
                                            }`}
                                    >
                                        S{week.weekNumber}
                                    </button>
                                ))}
                                {/* Botones add/remove en móvil */}
                                <div className="sm:hidden flex gap-0.5 ml-auto flex-shrink-0">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.addWeek('')} className="h-7 px-1.5 text-xs">
                                        <Plus size={12} />
                                    </Button>
                                    {editor.weeks.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => editor.removeWeek(editor.selectedWeekIndex)} className="h-7 px-1.5 text-xs">
                                            <Trash2 size={12} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Selector de días */}
                        <div className="space-y-1 sm:space-y-2">
                            <div className="hidden sm:flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-slate-400">Día {editor.selectedDayIndex + 1} de {currentWeek?.days.length || 0}</span>
                                <div className="flex gap-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={editor.addDay} className="h-8 px-2 text-xs">
                                        <Plus size={14} />
                                    </Button>
                                    {currentWeek?.days.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => editor.removeDay(editor.selectedDayIndex)} className="h-8 px-2 text-xs">
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-0.5 overflow-x-auto pb-1 sm:gap-1">
                                {currentWeek?.days.map((day, i) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => editor.setSelectedDayIndex(i)}
                                        className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors truncate max-w-[80px] sm:max-w-none ${editor.selectedDayIndex === i
                                            ? 'bg-green-600 text-slate-50'
                                            : 'bg-slate-800 text-slate-400 hover:text-slate-50'
                                            }`}
                                    >
                                        {day.dayName}
                                    </button>
                                ))}
                                {/* Botones add/remove en móvil */}
                                <div className="sm:hidden flex gap-0.5 ml-auto flex-shrink-0">
                                    <Button type="button" variant="ghost" size="sm" onClick={editor.addDay} className="h-7 px-1.5 text-xs">
                                        <Plus size={12} />
                                    </Button>
                                    {currentWeek?.days.length > 1 && (
                                        <Button type="button" variant="danger" size="sm" onClick={() => editor.removeDay(editor.selectedDayIndex)} className="h-7 px-1.5 text-xs">
                                            <Trash2 size={12} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor del día seleccionado */}
                    <div className="p-3 sm:p-4 space-y-3">
                        {currentDay && (
                            <>
                                {/* Nombre del día editable */}
                                <div className="flex-1">
                                    <label className="text-xs text-slate-400 block mb-1">Nombre del día</label>
                                    <Input
                                        placeholder="Ej: Día 1"
                                        value={currentDay.dayName}
                                        onChange={(e) => editor.updateDayName(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Descripción del día */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Descripción (opcional)</label>
                                    <textarea
                                        placeholder="Ej: Volumen, técnica..."
                                        value={currentDay.description || ''}
                                        onChange={(e) => editor.updateDayDescription(e.target.value)}
                                        rows={2}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none resize-none"
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
                                                <div className="space-y-2">
                                                    {/* Fila 1: selector principal + botón borrar */}
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={getPrimarySelectValue(exercise.name)}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'Comp SQ') editor.updateExercise(exIndex, 'name', 'Comp SQ');
                                                                else if (val === 'Comp BP') editor.updateExercise(exIndex, 'name', 'Comp BP');
                                                                else if (val === 'Comp DL') editor.updateExercise(exIndex, 'name', 'Comp DL');
                                                                else if (val === 'variant') editor.updateExercise(exIndex, 'name', SQUAT_VARIANTS[0]);
                                                                else if (val === 'accessory') editor.updateExercise(exIndex, 'name', ACCESSORY_LIST[0]);
                                                                else editor.updateExercise(exIndex, 'name', '');
                                                            }}
                                                            className="flex-1 h-9 px-2 sm:px-3 rounded-md bg-slate-950 border border-slate-700 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none min-w-0"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="Comp SQ">Sentadilla (Comp)</option>
                                                            <option value="Comp BP">Banca (Comp)</option>
                                                            <option value="Comp DL">Peso Muerto (Comp)</option>
                                                            <option value="variant">Variantes</option>
                                                            <option value="accessory">Accesorios</option>
                                                        </select>
                                                        <Button
                                                            type="button"
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => editor.removeExercise(exIndex)}
                                                            className="h-9 px-2 shrink-0"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>

                                                    {/* Fila 2: segundo selector (Variantes) */}
                                                    {getPrimarySelectValue(exercise.name) === 'variant' && (() => {
                                                        const subgroup = getVariantSubgroup('variant', exercise.name);
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    value={subgroup}
                                                                    onChange={(e) => {
                                                                        const sg = e.target.value;
                                                                        if (sg === 'sq') editor.updateExercise(exIndex, 'name', SQUAT_VARIANTS[0]);
                                                                        else if (sg === 'bp') editor.updateExercise(exIndex, 'name', BENCH_VARIANTS[0]);
                                                                        else editor.updateExercise(exIndex, 'name', DEADLIFT_VARIANTS[0]);
                                                                    }}
                                                                    className="h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none shrink-0"
                                                                >
                                                                    <option value="sq">Squat</option>
                                                                    <option value="bp">Bench Press</option>
                                                                    <option value="dl">Deadlift</option>
                                                                </select>
                                                                <select
                                                                    value={exercise.name}
                                                                    onChange={(e) => editor.updateExercise(exIndex, 'name', e.target.value)}
                                                                    className="flex-1 h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none min-w-0"
                                                                >
                                                                    {(subgroup === 'sq' ? SQUAT_VARIANTS : subgroup === 'bp' ? BENCH_VARIANTS : DEADLIFT_VARIANTS)
                                                                        .map(v => <option key={v} value={v}>{v}</option>)}
                                                                </select>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Fila 2: segundo selector (Accesorios) */}
                                                    {getPrimarySelectValue(exercise.name) === 'accessory' && (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={getExerciseCategory(exercise.name) === 'accessory_other' ? '__other__' : exercise.name}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '__other__') {
                                                                        editor.updateExercise(exIndex, 'name', '__otro__');
                                                                    } else {
                                                                        editor.updateExercise(exIndex, 'name', e.target.value);
                                                                    }
                                                                }}
                                                                className="flex-1 h-9 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs sm:text-sm focus:border-slate-500 outline-none min-w-0"
                                                            >
                                                                {ACCESSORY_LIST.filter(a => a !== 'Otros').map(a => (
                                                                    <option key={a} value={a}>{a}</option>
                                                                ))}
                                                                <option value="__other__">Otro...</option>
                                                            </select>
                                                            {getExerciseCategory(exercise.name) === 'accessory_other' && (
                                                                <Input
                                                                    placeholder="Nombre del accesorio"
                                                                    value={exercise.name === '__otro__' ? '' : exercise.name}
                                                                    onChange={(e) => editor.updateExercise(exIndex, 'name', e.target.value || '__otro__')}
                                                                    className="flex-1 text-xs sm:text-sm min-w-0"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Input de tempo o pausa si aplica */}
                                                {(exercise.name.toLowerCase().includes('tempo') || exercise.name.toLowerCase().includes('pausa')) && (
                                                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                                                        <span className="text-amber-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                                                            {exercise.name.toLowerCase().includes('tempo') ? '⏱ Tempo:' : '⏸ Pausa:'}
                                                        </span>
                                                        <Input
                                                            placeholder={exercise.name.toLowerCase().includes('tempo') ? 'Ej: 3-1-3-1' : 'Ej: 2 seg'}
                                                            value={exercise.notes || ''}
                                                            onChange={(e) => editor.updateExercise(exIndex, 'notes', e.target.value)}
                                                            className="flex-1 text-xs h-8 bg-transparent border-amber-500/40 text-amber-100 placeholder:text-amber-500"
                                                        />
                                                    </div>
                                                )}

                                                {/* Series del ejercicio - Responsive */}
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
                                                                    onChange={(e) => editor.updateSet(exIndex, setIndex, 'suggestedWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                    className="h-10 text-sm"
                                                                />

                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="8"
                                                                    value={set.targetReps || ''}
                                                                    onChange={(e) => editor.updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
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
                                                                            editor.updateSet(exIndex, setIndex, 'targetRpe', val);
                                                                        } else if (e.target.value === '') {
                                                                            editor.updateSet(exIndex, setIndex, 'targetRpe', undefined);
                                                                        }
                                                                    }}
                                                                    className="h-10 text-sm"
                                                                    autoComplete="off"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => editor.removeSet(exIndex, setIndex)}
                                                                    disabled={exercise.sets.length <= 1}
                                                                    className="text-slate-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Móvil: Cards grandes y visuales */}
                                                    <div className="sm:hidden space-y-2.5">
                                                        {exercise.sets.map((set, setIndex) => (
                                                            <div key={set.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 space-y-2.5 transform transition-all hover:border-slate-600">
                                                                {/* Header de la serie */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-brandRed-600/20 text-brandRed-500 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700">
                                                                            {setIndex + 1}
                                                                        </div>
                                                                        <span className="text-slate-50 font-medium">Serie {setIndex + 1}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => editor.removeSet(exIndex, setIndex)}
                                                                        disabled={exercise.sets.length <= 1}
                                                                        className="text-slate-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 hover:bg-red-900/20 rounded transition-colors"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>

                                                                {/* Grid de inputs - 3 columnas en móvil */}
                                                                <div className="grid grid-cols-3 gap-2.5">

                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Kg (sug.)</label>
                                                                        <Input
                                                                            type="number"
                                                                            inputMode="decimal"
                                                                            placeholder="80"
                                                                            min="0"
                                                                            step="0.5"
                                                                            value={set.suggestedWeight || ''}
                                                                            onChange={(e) => editor.updateSet(exIndex, setIndex, 'suggestedWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-slate-500 focus:bg-slate-900 pointer-events-auto"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Reps</label>
                                                                        <Input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            placeholder="8"
                                                                            value={set.targetReps || ''}
                                                                            onChange={(e) => editor.updateSet(exIndex, setIndex, 'targetReps', e.target.value)}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-slate-500 focus:bg-slate-900 pointer-events-auto"
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
                                                                                    editor.updateSet(exIndex, setIndex, 'targetRpe', val);
                                                                                } else if (e.target.value === '') {
                                                                                    editor.updateSet(exIndex, setIndex, 'targetRpe', undefined);
                                                                                }
                                                                            }}
                                                                            className="h-11 text-lg font-bold text-center bg-slate-950 border-slate-600 focus:border-slate-500 focus:bg-slate-900 pointer-events-auto"
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
                                                        onClick={() => editor.addSet(exIndex)}
                                                        className="w-full text-xs sm:text-sm h-9 sm:h-8 text-slate-400 hover:text-slate-50 bg-slate-950/30 hover:bg-slate-900/50"
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
                                        onClick={editor.addExercise}
                                        className="w-full text-xs sm:text-sm h-9"
                                    >
                                        <Plus size={16} className="mr-1.5" /> Ejercicio
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                    </div>{/* fin zona scrollable */}

                    {/* Pie del modal - Responsive */}
                    <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2 bg-slate-950/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !editor.title} className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
