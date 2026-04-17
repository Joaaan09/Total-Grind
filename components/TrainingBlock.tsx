import React, { useState } from 'react';
import { TrainingBlock, TrainingWeek, TrainingDay } from '../types';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Tabs, TabsList, TabsTrigger } from './ui';
import { Calendar, ChevronRight, User, Plus, Edit2, PlayCircle } from 'lucide-react';
import WorkoutSession from './WorkoutSession';

// Props para la lista de bloques de entrenamiento
interface TrainingBlockListProps {
  blocks: TrainingBlock[];
  onSelectBlock: (blockId: string) => void;
  onCreateBlock: () => void;
}

export const TrainingBlockList: React.FC<TrainingBlockListProps> = ({ blocks, onSelectBlock, onCreateBlock }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'assigned'>('personal');

  const filteredBlocks = blocks.filter(b => b.source === activeTab);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Planificación</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Gestiona tus mesociclos de entrenamiento.</p>
        </div>
        <Button onClick={onCreateBlock} className="gap-2 flex-shrink-0 text-xs sm:text-sm">
          <Plus size={16} className="sm:block hidden" />
          <Plus size={14} className="sm:hidden" />
          <span className="hidden sm:inline">Nuevo Bloque</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" activeValue={activeTab} onClick={() => setActiveTab('personal')} className="text-xs sm:text-sm">
            Mis Planes
          </TabsTrigger>
          <TabsTrigger value="assigned" activeValue={activeTab} onClick={() => setActiveTab('assigned')} className="text-xs sm:text-sm">
            Asignados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBlocks.map((block) => (
          <Card
            key={block.id}
            className="group cursor-pointer hover:border-blue-500/50 transition-all hover:bg-slate-900"
            onClick={() => onSelectBlock(block.id)}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex justify-between items-start gap-2">
                <Badge variant={block.source === 'assigned' ? 'secondary' : 'default'} className="mb-2 text-xs">
                  {block.source === 'assigned' ? 'Coach' : 'Personal'}
                </Badge>
                {block.source === 'assigned' && <User size={14} className="text-slate-500 flex-shrink-0" />}
              </div>
              <CardTitle className="group-hover:text-blue-400 transition-colors text-base sm:text-lg truncate">{block.title}</CardTitle>
              {block.assignedBy && <p className="text-xs text-slate-500 truncate">Por: {block.assignedBy}</p>}
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="flex items-center text-xs sm:text-sm text-slate-400 gap-2 mb-3">
                <Calendar size={14} className="flex-shrink-0" />
                <span className="truncate">{block.startDate || 'Sin fecha'}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500">{block.weeks.length} semanas</span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-lg">
            <p className="text-slate-500">No hay planificaciones en esta sección.</p>
            {activeTab === 'personal' && (
              <Button variant="ghost" className="mt-2 text-blue-500" onClick={onCreateBlock}>Crear mi primer bloque</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Props para la vista de detalle de un bloque
interface BlockDetailProps {
  block: TrainingBlock;
  onBack: () => void;
  onEdit: (block: TrainingBlock) => void;
  onRefresh?: () => void;
}

export const BlockDetail: React.FC<BlockDetailProps> = ({ block, onBack, onEdit, onRefresh }) => {
  const [selectedWeek, setSelectedWeek] = useState<string>(block.weeks[0]?.id);
  const [activeSessionDay, setActiveSessionDay] = useState<TrainingDay | null>(null);

  const currentWeek = block.weeks.find(w => w.id === selectedWeek);

  if (activeSessionDay) {
    return (
      <WorkoutSession
        day={activeSessionDay}
        onComplete={() => { setActiveSessionDay(null); onRefresh?.(); }}
        onCancel={() => setActiveSessionDay(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white pl-0">
          &larr; Volver
        </Button>
      </div>

      <div className="flex flex-col gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{block.title}</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {block.source === 'assigned' ? `Asignado por ${block.assignedBy}` : 'Planificación Personal'}
            </p>
          </div>
          {block.description && (
            <div className="flex flex-col gap-2 bg-slate-800/60 border border-slate-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg max-w-full sm:max-w-xl">
              <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">Descripción:</span>
              <p className="text-slate-300 text-sm">{block.description}</p>
            </div>
          )}
        </div>

        {block.source !== 'assigned' && (
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => onEdit(block)}>
            <Edit2 size={16} /> Editar Bloque
          </Button>
        )}
      </div>

      {/* Selector de semanas */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {block.weeks.map((week) => (
          <button
            key={week.id}
            onClick={() => setSelectedWeek(week.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedWeek === week.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
          >
            Semana {week.weekNumber}
          </button>
        ))}
      </div>

      {/* Grid de días de entrenamiento */}
      <div className="grid gap-3 sm:gap-4 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {currentWeek?.days.map((day) => (
          <Card key={day.id} className="relative overflow-hidden group">
            {day.isCompleted && (
              <div className="absolute top-0 right-0 p-2 bg-green-900/20 text-green-500 rounded-bl-lg">
                <Calendar size={16} />
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">{day.dayName}</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">{day.exercises.length} Ejercicios</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ul className="space-y-2 mb-6">
                {day.exercises.slice(0, 3).map((ex) => (
                  <li key={ex.id} className="text-xs sm:text-sm text-slate-400 truncate border-l-2 border-slate-800 pl-2">
                    {ex.name}
                  </li>
                ))}
                {day.exercises.length > 3 && <li className="text-xs text-slate-600 italic">+ {day.exercises.length - 3} más</li>}
              </ul>
              <Button
                className="w-full gap-2 text-sm sm:text-base h-10 sm:h-11"
                variant={day.isCompleted ? "secondary" : "primary"}
                onClick={() => setActiveSessionDay(day)}
              >
                <PlayCircle size={18} />
                {day.isCompleted ? 'Ver / Editar' : 'Iniciar Sesión'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};