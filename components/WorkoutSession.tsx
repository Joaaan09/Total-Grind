import React, { useState } from 'react';
import { TrainingDay, Exercise, ExerciseSet } from '../types';
import { calculate1RM, TrainingService } from '../services/mockService';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui';
import { CheckCircle2, Circle, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Props para el componente de sesión de entrenamiento
interface WorkoutSessionProps {
  day: TrainingDay;
  onComplete: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ day, onComplete }) => {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>(day.exercises);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSetUpdate = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: string | number) => {
    setExercises(prevExercises => prevExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      return {
        ...ex,
        sets: ex.sets.map(set => {
          if (set.id !== setId) return set;

          const updatedSet = { ...set, [field]: value };

          // Calcular automáticamente el 1RM si hay peso y repeticiones
          if ((field === 'weight' || field === 'reps' || field === 'rpe') && (updatedSet.weight || field === 'weight')) {
            const w = field === 'weight' ? Number(value) : Number(updatedSet.weight);
            const r = field === 'reps' ? Number(value) : Number(updatedSet.reps);
            const rpe = field === 'rpe' ? Number(value) : Number(updatedSet.rpe || 10);

            if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
              updatedSet.estimated1rm = calculate1RM(w, r, rpe);
            }
          }

          return updatedSet;
        })
      };
    }));
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(prevExercises => prevExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(set => {
          if (set.id !== setId) return set;
          return { ...set, isCompleted: !set.isCompleted };
        })
      };
    }));
  };

  const handleSave = async () => {
    if (!token) {
      alert("Error: No hay sesión activa");
      return;
    }

    setIsSaving(true);
    // Preparar el objeto del día actualizado con los ejercicios completados
    const updatedDay: TrainingDay = {
      ...day,
      exercises: exercises,
      isCompleted: true
    };

    const success = await TrainingService.updateDay(token, day.id, updatedDay);
    setIsSaving(false);

    if (success) {
      setSessionComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      alert("Error al guardar la sesión. Revisa la consola o la conexión al backend.");
    }
  };

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 animate-in zoom-in-50">
        <div className="h-20 w-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white">¡Entrenamiento Guardado!</h2>
        <p className="text-slate-400">Datos sincronizados con la base de datos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{day.dayName}</h1>
          <p className="text-slate-400 text-sm">Registra tus series reales</p>
        </div>
        <Button onClick={handleSave} className="gap-2" variant="primary" disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar Sesión'}</span>
        </Button>
      </div>

      {exercises.map((exercise) => (
        <Card key={exercise.id} className="overflow-hidden border-slate-800 bg-slate-900/40">
          <CardHeader className="bg-slate-900/60 pb-4 border-b border-slate-800">
            <CardTitle className="flex justify-between items-center text-lg text-blue-400">
              {exercise.name}
            </CardTitle>
            {exercise.notes && <p className="text-xs text-slate-500 mt-1">{exercise.notes}</p>}
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 uppercase text-sm">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[80px]">Objetivo</th>
                    <th className="p-3 w-20">Kg</th>
                    <th className="p-3 w-16">Reps</th>
                    <th className="p-3 w-16">RPE</th>
                    <th className="p-3 w-16 text-center">e1RM</th>
                    <th className="p-3 w-12 text-center">Ok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {exercise.sets.map((set, index) => (
                    <tr key={set.id} className={set.isCompleted ? "bg-green-900/10" : ""}>
                      <td className="p-3 text-center text-slate-500 font-mono">{index + 1}</td>
                      <td className="p-3 text-slate-400 text-xs">
                        <div className="flex flex-col">
                          <span>{set.targetReps} reps</span>
                          <span className="text-slate-600">@ RPE {set.targetRpe}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-full h-10 px-2 bg-slate-950 border-slate-700 focus:border-blue-500 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={set.weight || ''}
                          onChange={(e) => handleSetUpdate(exercise.id, set.id, 'weight', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-full h-10 px-2 bg-slate-950 border-slate-700 focus:border-blue-500 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={set.reps || ''}
                          onChange={(e) => handleSetUpdate(exercise.id, set.id, 'reps', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="-"
                          max={10}
                          className="w-full h-10 px-2 bg-slate-950 border-slate-700 focus:border-blue-500 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={set.rpe || ''}
                          onChange={(e) => handleSetUpdate(exercise.id, set.id, 'rpe', e.target.value)}
                        />
                      </td>
                      <td className="p-3 text-center text-slate-500 font-mono text-xs">
                        {set.estimated1rm ? Math.round(set.estimated1rm) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSetComplete(exercise.id, set.id)}
                          className={`p-1 rounded-full transition-colors ${set.isCompleted ? 'text-green-500 bg-green-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                          {set.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Botón flotante de guardar para móviles */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-500" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
        </Button>
      </div>
    </div>
  );
};

export default WorkoutSession;