import { useState, useEffect } from 'react';
import { TrainingBlock, TrainingWeek, TrainingDay, Exercise, ExerciseSet } from '../types';

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const createDefaultDay = (dayNum: number): TrainingDay => ({
    id: generateId(),
    weekId: '',
    dayName: `Día ${dayNum}`,
    isCompleted: false,
    exercises: []
});

export const createDefaultWeek = (weekNumber: number): TrainingWeek => ({
    id: generateId(),
    blockId: '',
    weekNumber,
    days: [createDefaultDay(1)]
});

interface UseBlockEditorProps {
    initialTitle?: string;
    initialDescription?: string;
    initialStartDate?: string;
    initialWeeks?: TrainingWeek[];
}

export const useBlockEditor = ({
    initialTitle = '',
    initialDescription = '',
    initialStartDate = new Date().toISOString().split('T')[0],
    initialWeeks
}: UseBlockEditorProps = {}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [startDate, setStartDate] = useState(initialStartDate);
    const [weeks, setWeeks] = useState<TrainingWeek[]>(initialWeeks || [createDefaultWeek(1)]);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // Permitir reiniciar el estado si cambian las props iniciales (para EditBlockModal)
    useEffect(() => {
        if (initialWeeks) {
            setTitle(initialTitle);
            setDescription(initialDescription);
            setStartDate(initialStartDate);
            setWeeks(JSON.parse(JSON.stringify(initialWeeks))); // Deep copy
            setSelectedWeekIndex(0);
            setSelectedDayIndex(0);
        }
    }, [initialTitle, initialDescription, initialStartDate, initialWeeks]);

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

    // --- S E M A N A S ---
    const addWeek = (blockId = '') => {
        const lastWeek = weeks[weeks.length - 1];
        const newWeek: TrainingWeek = {
            id: generateId(),
            blockId,
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
                        weight: undefined,
                        rpe: undefined,
                        estimated1rm: undefined,
                        isCompleted: false
                    }))
                }))
            }))
        };
        const newWeekIndex = weeks.length;
        setWeeks([...weeks, newWeek]);
        setSelectedWeekIndex(newWeekIndex);
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

    // --- D Í A S ---
    const addDay = () => {
        const newDay = createDefaultDay(currentWeek.days.length + 1);
        const newDayIndex = currentWeek.days.length;
        const updatedWeeks = [...weeks];
        updatedWeeks[selectedWeekIndex].days.push(newDay);
        setWeeks(updatedWeeks);
        setSelectedDayIndex(newDayIndex);
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

    // --- E J E R C I C I O S ---
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

    // --- S E R I E S ---
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

    return {
        title, setTitle,
        description, setDescription,
        startDate, setStartDate,
        weeks,
        selectedWeekIndex, setSelectedWeekIndex,
        selectedDayIndex, setSelectedDayIndex,
        currentWeek, currentDay,
        resetForm,
        addWeek, removeWeek,
        addDay, updateDayName, updateDayDescription, removeDay,
        addExercise, updateExercise, removeExercise,
        addSet, updateSet, removeSet
    };
};
