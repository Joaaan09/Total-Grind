import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProgressData } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsList, TabsTrigger } from './ui';
import { TrendingUp } from 'lucide-react';
import { useTrainingData } from '../contexts/TrainingDataContext';

// Solo mostrar levantamientos de competición (SQ, BP, DL)
const COMPETITION_LIFTS = ['Comp SQ', 'Comp BP', 'Comp DL'];
const LIFT_LABELS: Record<string, string> = {
  'Comp SQ': 'Sentadilla',
  'Comp BP': 'Banca',
  'Comp DL': 'Peso Muerto',
  'Total': 'Total SBD'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-md shadow-xl">
        <p className="text-slate-50 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Función auxiliar para obtener el mejor 1RM estimado de un ejercicio
const getBestEstimated = (data: ProgressData[], exerciseName: string): number => {
  const exercise = data.find(p => p.exerciseName === exerciseName);
  if (!exercise || !exercise.history.length) return 0;
  return Math.max(...exercise.history.map(h => h.estimatedMax || 0));
};

const getBestActual = (data: ProgressData[], exerciseName: string): number => {
  const exercise = data.find(p => p.exerciseName === exerciseName);
  if (!exercise || !exercise.history.length) return 0;
  return Math.max(...exercise.history.map(h => h.actualMax || 0));
};

export const ProgressCharts: React.FC = () => {
  const { progressData: data } = useTrainingData();
  // Filtrar solo levantamientos de competición
  const competitionData = data.filter(d => COMPETITION_LIFTS.includes(d.exerciseName));

  const [selectedExercise, setSelectedExercise] = React.useState<string>('Comp SQ');

  // Actualizar selección si los datos cambian y la selección actual no es válida
  React.useEffect(() => {
    if (competitionData.length > 0 && selectedExercise !== 'Total' && !competitionData.some(d => d.exerciseName === selectedExercise)) {
      setSelectedExercise(competitionData[0].exerciseName);
    }
  }, [competitionData, selectedExercise]);

  // Calcular totales para cada levantamiento de competición
  const sqBest = getBestEstimated(data, 'Comp SQ');
  const bpBest = getBestEstimated(data, 'Comp BP');
  const dlBest = getBestEstimated(data, 'Comp DL');
  const totalSBD = sqBest + bpBest + dlBest;

  const sqActual = getBestActual(data, 'Comp SQ');
  const bpActual = getBestActual(data, 'Comp BP');
  const dlActual = getBestActual(data, 'Comp DL');
  const totalActual = sqActual + bpActual + dlActual;

  // Obtener datos actuales para el gráfico
  const currentData = selectedExercise === 'Total'
    ? [] // No chart for total (could implement later with combined data)
    : competitionData.find(d => d.exerciseName === selectedExercise)?.history || [];

  if (competitionData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Progreso de Competición</h1>
          <p className="text-slate-400">Historial de tus levantamientos principales (SQ, BP, DL).</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg bg-slate-900/20">
          <div className="p-4 bg-slate-800 rounded-full mb-4">
            <TrendingUp size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-50 mb-2">Sin datos de progreso</h3>
          <p className="text-slate-400 max-w-sm">
            Completa sesiones de entrenamiento con ejercicios de competición (Comp SQ, Comp BP, Comp DL) para ver tu progreso aquí.
          </p>
        </div>
      </div>
    );
  }

  // Obtener mejor 1RM estimado y real para el ejercicio seleccionado
  const bestEstimated = selectedExercise === 'Total'
    ? totalSBD
    : (currentData.length > 0 ? Math.max(...currentData.map(d => d.estimatedMax || 0)) : 0);
  const bestActual = selectedExercise === 'Total'
    ? totalActual
    : (currentData.length > 0 ? Math.max(...currentData.map(d => d.actualMax || 0)) : 0);
  const lastEntry = currentData[currentData.length - 1];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-50">Progreso de Competición</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Historial de tus levantamientos principales (SQ, BP, DL).</p>
      </div>

      <Card className="p-0 sm:p-1">
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <Tabs value={selectedExercise} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 space-x-1 sm:space-x-2">
              {competitionData.map((d) => (
                <button
                  key={d.exerciseName}
                  onClick={() => setSelectedExercise(d.exerciseName)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${selectedExercise === d.exerciseName
                    ? 'bg-brandRed-600 text-slate-50'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-50'
                    }`}
                >
                  {LIFT_LABELS[d.exerciseName] || d.exerciseName}
                </button>
              ))}
              {/* Pestaña de Total SBD */}
              <button
                onClick={() => setSelectedExercise('Total')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${selectedExercise === 'Total'
                  ? 'bg-purple-600 text-slate-50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-50'
                  }`}
              >
                Total SBD
              </button>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="h-[400px] w-full pt-4">
          {selectedExercise === 'Total' ? (
            // Vista de Total SBD - mostrar desglose
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-purple-400 mb-4">
                {totalSBD > 0 ? totalSBD : '-'} <span className="text-2xl text-slate-500">kg</span>
              </div>
              <p className="text-slate-400 mb-8">Total SBD Estimado (e1RM)</p>

              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-slate-500 text-sm">Sentadilla</p>
                  <p className="text-2xl font-bold text-brandRed-500">{sqBest || '-'} <span className="text-sm text-slate-500">kg</span></p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Banca</p>
                  <p className="text-2xl font-bold text-brandRed-500">{bpBest || '-'} <span className="text-sm text-slate-500">kg</span></p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Peso Muerto</p>
                  <p className="text-2xl font-bold text-brandRed-500">{dlBest || '-'} <span className="text-sm text-slate-500">kg</span></p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm mb-2">Total Real Levantado</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {totalActual > 0 ? totalActual : '-'} <span className="text-lg text-slate-500">kg</span>
                </p>
              </div>
            </div>
          ) : (
            // Gráfico de levantamiento individual
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 2 }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => <span className="text-slate-50">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="estimatedMax"
                  name="e1RM Estimado"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#60a5fa' }}
                />
                <Line
                  type="monotone"
                  dataKey="actualMax"
                  name="Máximo Real"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#4ade80' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-sm uppercase font-bold tracking-wider">Mejor e1RM</span>
            <span className="text-4xl font-bold text-brandRed-500 mt-2">
              {bestEstimated > 0 ? bestEstimated : '-'} <span className="text-lg text-slate-500 font-normal">kg</span>
            </span>
            <span className="text-brandRed-500 text-xs mt-2 flex items-center gap-1">
              {LIFT_LABELS[selectedExercise] || selectedExercise}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-sm uppercase font-bold tracking-wider">Máximo Real</span>
            <span className="text-4xl font-bold text-emerald-500 mt-2">
              {bestActual > 0 ? bestActual : '-'} <span className="text-lg text-slate-500 font-normal">kg</span>
            </span>
            <span className="text-emerald-500 text-xs mt-2 flex items-center gap-1">
              ▲ PR Levantado
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-sm uppercase font-bold tracking-wider">Última Sesión</span>
            <span className="text-4xl font-bold text-slate-50 mt-2">
              {lastEntry?.estimatedMax || '-'} <span className="text-lg text-slate-500 font-normal">kg</span>
            </span>
            <span className="text-slate-600 text-xs mt-2">{lastEntry?.date || 'Sin datos'}</span>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/30 border-purple-800/50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-purple-400 text-sm uppercase font-bold tracking-wider">Total SBD</span>
            <span className="text-4xl font-bold text-purple-400 mt-2">
              {totalSBD > 0 ? totalSBD : '-'} <span className="text-lg text-slate-500 font-normal">kg</span>
            </span>
            <span className="text-purple-500 text-xs mt-2 flex items-center gap-1">
              SQ + BP + DL
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};