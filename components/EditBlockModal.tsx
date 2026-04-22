import React, { useState } from 'react';
import { Button, Input, Card, CardContent } from './ui';
import { Loader2, Save, Trash2, Plus, X } from 'lucide-react';
import { TrainingBlock } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { useBlockEditor } from '../hooks/useBlockEditor';
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full sm:max-w-2xl lg:max-w-[1600px] bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">

                {/* Cabecera */}
                <div className="flex-none flex items-start justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-50 truncate">Editar Bloque</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-50 p-1 shrink-0 ml-2">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* Información básica */}
                    <div className="flex-none p-3 sm:p-4 border-b border-slate-800 space-y-3">
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
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        <div className="hidden sm:block space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-50">Descripción (opcional)</label>
                            <textarea
                                placeholder="Objetivo, fase, notas..."
                                value={editor.description}
                                onChange={(e) => editor.setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-50 text-sm focus:border-slate-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Zona scrollable: columnas de semanas */}
                    <div className="flex-1 overflow-auto bg-slate-950/20">
                        <div className="flex min-w-max p-6 gap-6 min-h-full">

                            {/* Una columna por semana */}
                            {editor.weeks.map((week, wIdx) => (
                                <div key={week.id} className="flex flex-col w-[380px] shrink-0 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">

                                    {/* Header semana - sticky */}
                                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-slate-800/40 border-b border-slate-800 backdrop-blur-md rounded-t-2xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brandRed-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                            <span className="text-xs font-black text-brandRed-400 uppercase tracking-widest">Semana {week.weekNumber}</span>
                                        </div>
                                        {editor.weeks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => editor.removeWeek(wIdx)}
                                                className="text-slate-500 hover:text-red-400 transition-all p-1.5 rounded-full hover:bg-red-500/10"
                                                title="Eliminar semana"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Días de la semana */}
                                    <div className="flex flex-col p-3 gap-4 flex-1">
                                        {week.days.map((day, dIdx) => (
                                            <div key={day.id} className="rounded-lg border border-slate-700/60 bg-slate-800/30 overflow-hidden">

                                                {/* Cabecera del día */}
                                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-700/40">
                                                    <Input
                                                        placeholder="Nombre del día"
                                                        value={day.dayName}
                                                        onChange={(e) => editor.updateDayName(wIdx, dIdx, e.target.value)}
                                                        className="flex-1 h-7 text-xs font-semibold bg-transparent border-transparent focus:border-slate-600 px-1"
                                                    />
                                                    {week.days.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.removeDay(dIdx, wIdx)}
                                                            className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded shrink-0"
                                                            title="Eliminar día"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Cuerpo del día */}
                                                <div className="p-3 space-y-2">
                                                    {/* Descripción */}
                                                    <textarea
                                                        placeholder="Descripción del día (opcional)"
                                                        value={day.description || ''}
                                                        onChange={(e) => editor.updateDayDescription(wIdx, dIdx, e.target.value)}
                                                        rows={2}
                                                        className="w-full bg-slate-950/60 border border-slate-700/50 rounded-md px-2 py-1.5 text-slate-300 text-xs focus:border-slate-500 outline-none resize-none placeholder:text-slate-600"
                                                    />

                                                    {/* Ejercicios */}
                                                    <div className="space-y-2">
                                                        {day.exercises.length === 0 && (
                                                            <div className="text-center py-4 text-slate-600 border border-dashed border-slate-700/50 rounded-lg">
                                                                <p className="text-xs">Sin ejercicios</p>
                                                            </div>
                                                        )}

                                                        {day.exercises.map((exercise, exIndex) => (
                                                            <Card key={exercise.id} className="border-slate-700/60 bg-slate-900/60">
                                                                <CardContent className="p-2.5 sm:p-4 md:p-6 space-y-4">
                                                                    {/* Selector principal + borrar */}
                                                                    <div className="flex items-center gap-1.5">
                                                                        <select
                                                                            value={getPrimarySelectValue(exercise.name)}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                if (val === 'Comp SQ') editor.updateExercise(wIdx, dIdx, exIndex, 'name', 'Comp SQ');
                                                                                else if (val === 'Comp BP') editor.updateExercise(wIdx, dIdx, exIndex, 'name', 'Comp BP');
                                                                                else if (val === 'Comp DL') editor.updateExercise(wIdx, dIdx, exIndex, 'name', 'Comp DL');
                                                                                else if (val === 'variant') editor.updateExercise(wIdx, dIdx, exIndex, 'name', SQUAT_VARIANTS[0]);
                                                                                else if (val === 'accessory') editor.updateExercise(wIdx, dIdx, exIndex, 'name', ACCESSORY_LIST[0]);
                                                                                else editor.updateExercise(wIdx, dIdx, exIndex, 'name', '');
                                                                            }}
                                                                            className="flex-1 h-8 px-2 rounded-md bg-slate-950 border border-slate-700 text-slate-50 text-xs focus:border-slate-500 outline-none min-w-0"
                                                                        >
                                                                            <option value="">Seleccionar...</option>
                                                                            <option value="Comp SQ">Sentadilla (Comp)</option>
                                                                            <option value="Comp BP">Banca (Comp)</option>
                                                                            <option value="Comp DL">Peso Muerto (Comp)</option>
                                                                            <option value="variant">Variantes</option>
                                                                            <option value="accessory">Accesorios</option>
                                                                        </select>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => editor.removeExercise(wIdx, dIdx, exIndex)}
                                                                            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded shrink-0"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Selector variantes */}
                                                                    {getPrimarySelectValue(exercise.name) === 'variant' && (() => {
                                                                        const subgroup = getVariantSubgroup('variant', exercise.name);
                                                                        return (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <select
                                                                                    value={subgroup}
                                                                                    onChange={(e) => {
                                                                                        const sg = e.target.value;
                                                                                        if (sg === 'sq') editor.updateExercise(wIdx, dIdx, exIndex, 'name', SQUAT_VARIANTS[0]);
                                                                                        else if (sg === 'bp') editor.updateExercise(wIdx, dIdx, exIndex, 'name', BENCH_VARIANTS[0]);
                                                                                        else editor.updateExercise(wIdx, dIdx, exIndex, 'name', DEADLIFT_VARIANTS[0]);
                                                                                    }}
                                                                                    className="h-8 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs focus:border-slate-500 outline-none shrink-0"
                                                                                >
                                                                                    <option value="sq">Squat</option>
                                                                                    <option value="bp">Bench Press</option>
                                                                                    <option value="dl">Deadlift</option>
                                                                                </select>
                                                                                <select
                                                                                    value={exercise.name}
                                                                                    onChange={(e) => editor.updateExercise(wIdx, dIdx, exIndex, 'name', e.target.value)}
                                                                                    className="flex-1 h-8 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs focus:border-slate-500 outline-none min-w-0"
                                                                                >
                                                                                    {(subgroup === 'sq' ? SQUAT_VARIANTS : subgroup === 'bp' ? BENCH_VARIANTS : DEADLIFT_VARIANTS)
                                                                                        .map(v => <option key={v} value={v}>{v}</option>)}
                                                                                </select>
                                                                            </div>
                                                                        );
                                                                    })()}

                                                                    {/* Selector accesorios */}
                                                                    {getPrimarySelectValue(exercise.name) === 'accessory' && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <select
                                                                                value={getExerciseCategory(exercise.name) === 'accessory_other' ? '__other__' : exercise.name}
                                                                                onChange={(e) => {
                                                                                    if (e.target.value === '__other__') editor.updateExercise(wIdx, dIdx, exIndex, 'name', '__otro__');
                                                                                    else editor.updateExercise(wIdx, dIdx, exIndex, 'name', e.target.value);
                                                                                }}
                                                                                className="flex-1 h-8 px-2 rounded-md bg-slate-900 border border-slate-600 text-slate-50 text-xs focus:border-slate-500 outline-none min-w-0"
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
                                                                                    onChange={(e) => editor.updateExercise(wIdx, dIdx, exIndex, 'name', e.target.value || '__otro__')}
                                                                                    className="flex-1 text-xs min-w-0 h-8"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Tempo / Pausa */}
                                                                    {(exercise.name.toLowerCase().includes('tempo') || exercise.name.toLowerCase().includes('pausa')) && (
                                                                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1.5">
                                                                            <span className="text-amber-500 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                                                                                {exercise.name.toLowerCase().includes('tempo') ? '⏱ Tempo:' : '⏸ Pausa:'}
                                                                            </span>
                                                                            <Input
                                                                                placeholder={exercise.name.toLowerCase().includes('tempo') ? 'Ej: 3-1-3-1' : 'Ej: 2 seg'}
                                                                                value={exercise.notes || ''}
                                                                                onChange={(e) => editor.updateExercise(wIdx, dIdx, exIndex, 'notes', e.target.value)}
                                                                                className="flex-1 text-xs h-7 bg-transparent border-amber-500/40 text-amber-100 placeholder:text-amber-500"
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {/* Series */}
                                                                    <div className="space-y-1.5">
                                                                        <div className="grid grid-cols-[24px_1fr_1fr_1fr_24px] gap-1 px-1">
                                                                            <div className="text-xs text-slate-600 text-center">#</div>
                                                                            <div className="text-xs text-slate-500 uppercase tracking-wide text-center">Kg</div>
                                                                            <div className="text-xs text-slate-500 uppercase tracking-wide text-center">Reps</div>
                                                                            <div className="text-xs text-slate-500 uppercase tracking-wide text-center">RPE</div>
                                                                            <div></div>
                                                                        </div>
                                                                        {exercise.sets.map((set, setIndex) => (
                                                                            <div key={set.id} className="grid grid-cols-[24px_1fr_1fr_1fr_24px] gap-1 items-center rounded px-1 py-1">
                                                                                <div className="text-xs text-slate-600 text-center font-mono">{setIndex + 1}</div>
                                                                                <Input
                                                                                    type="number"
                                                                                    placeholder="80"
                                                                                    min="0"
                                                                                    step="0.5"
                                                                                    value={set.suggestedWeight || ''}
                                                                                    onChange={(e) => editor.updateSet(wIdx, dIdx, exIndex, setIndex, 'suggestedWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                                    className="h-7 text-xs text-center px-1"
                                                                                />
                                                                                <Input
                                                                                    type="text"
                                                                                    inputMode="numeric"
                                                                                    placeholder="8"
                                                                                    value={set.targetReps || ''}
                                                                                    onChange={(e) => editor.updateSet(wIdx, dIdx, exIndex, setIndex, 'targetReps', e.target.value)}
                                                                                    className="h-7 text-xs text-center px-1"
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
                                                                                        if (!isNaN(val) && val >= 1 && val <= 10) editor.updateSet(wIdx, dIdx, exIndex, setIndex, 'targetRpe', val);
                                                                                        else if (e.target.value === '') editor.updateSet(wIdx, dIdx, exIndex, setIndex, 'targetRpe', undefined);
                                                                                    }}
                                                                                    className="h-7 text-xs text-center px-1"
                                                                                    autoComplete="off"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => editor.removeSet(wIdx, dIdx, exIndex, setIndex)}
                                                                                    disabled={exercise.sets.length <= 1}
                                                                                    className="text-slate-600 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
                                                                                >
                                                                                    <X size={12} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => editor.addSet(wIdx, dIdx, exIndex)}
                                                                            className="w-full flex items-center justify-center gap-1 py-1 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                                                                        >
                                                                            <Plus size={10} /> Serie
                                                                        </button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}

                                                        {/* + Ejercicio */}
                                                        <button
                                                            type="button"
                                                            onClick={() => editor.addExercise(wIdx, dIdx)}
                                                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors"
                                                        >
                                                            <Plus size={12} /> Ejercicio
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* + Día */}
                                        <button
                                            type="button"
                                            onClick={() => editor.addDay(wIdx)}
                                            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors"
                                        >
                                            <Plus size={12} /> Día
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Columna + Semana */}
                            <div className="flex flex-col items-start p-3 w-[160px] shrink-0">
                                <button
                                    type="button"
                                    onClick={() => editor.addWeek(block.id)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <Plus size={12} /> Semana
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Pie del modal */}
                    <div className="flex-none p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-slate-950/50">
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