import React from 'react';
import { User, TrainingBlock, ProgressData } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Calendar, TrendingUp, Users, Activity, ArrowRight } from 'lucide-react';

interface DashboardProps {
    user: User;
    activeBlocks: TrainingBlock[];
    progressData: ProgressData[];
    onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, activeBlocks, progressData, onNavigate }) => {
    // Calculate dynamic stats
    const totalSessions = activeBlocks.reduce((acc, block) => {
        return acc + block.weeks.reduce((wAcc, week) => {
            return wAcc + week.days.filter(d => d.isCompleted).length;
        }, 0);
    }, 0);

    // Calculate streak
    const streak = totalSessions > 0 ? Math.floor(totalSessions / 2) + 1 : 0;

    // Calculate SBD Total from progress history (using competition lifts)
    const getBestLift = (exerciseName: string) => {
        const exercise = progressData.find(p => p.exerciseName === exerciseName);
        if (!exercise || !exercise.history.length) return 0;
        // Use estimatedMax for the total, fallback to actualMax
        return Math.max(...exercise.history.map(h => h.estimatedMax || h.actualMax || 0));
    };

    // Use exact competition lift names
    const squat = getBestLift('Comp SQ');
    const bench = getBestLift('Comp BP');
    const deadlift = getBestLift('Comp DL');

    const sbdTotal = squat + bench + deadlift;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hola, {user.name.split(' ')[0]} 👋</h1>
                    <p className="text-slate-400">Listo para romper tus PRs hoy?</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onNavigate('/profile')}>
                        <Users size={18} className="mr-2" /> Mi perfil
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-900/20 border-blue-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/20 text-blue-500 rounded-lg">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Sesiones</p>
                                <p className="text-2xl font-bold text-white">{totalSessions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-600/20 text-green-500 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">SBD Total</p>
                                <p className="text-2xl font-bold text-white">{sbdTotal > 0 ? sbdTotal : '-'} <span className="text-sm font-normal text-slate-500">kg</span></p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600/20 text-purple-500 rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Racha</p>
                                <p className="text-2xl font-bold text-white">{streak} días</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-600/20 text-orange-500 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Coach</p>
                                <p className="text-xl font-bold text-white truncate max-w-[100px]">
                                    {user.coachId && typeof user.coachId === 'object' ? user.coachId.name : (user.coachId ? 'Entrenador' : '-')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Training Block */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Entrenamiento Activo</h2>
                    <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => onNavigate('/training')}>
                        Ver todo <ArrowRight size={16} className="ml-1" />
                    </Button>
                </div>

                {(() => {
                    const activeBlock = activeBlocks.find(block => {
                        const isCompleted = block.weeks.every(week =>
                            week.days.every(day => day.isCompleted)
                        );
                        return !isCompleted;
                    });

                    return activeBlock ? (
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-blue-400 font-semibold uppercase tracking-wider mb-1">Semana 1 / {activeBlock.weeks.length}</div>
                                    <h3 className="text-2xl font-bold text-white max-w-md truncate">{activeBlock.title}</h3>
                                    <p className="text-slate-400 mt-1">
                                        {activeBlock.weeks[0]?.days.find(d => !d.isCompleted)?.dayName || 'Todo completado'}
                                    </p>
                                    {activeBlock.source === 'assigned' && (
                                        <p className="text-xs text-blue-400 mt-1 bg-blue-900/20 inline-block px-2 py-1 rounded">
                                            Asignado por {activeBlock.assignedBy || 'Entrenador'}
                                        </p>
                                    )}
                                </div>
                                <Button size="lg" className="w-full md:w-auto shadow-lg shadow-blue-900/20" onClick={() => onNavigate(`/training/${activeBlock.id}`)}>
                                    Continuar Entreno
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-slate-700">
                            <CardContent className="p-8 text-center">
                                <p className="text-slate-500 mb-4">No tienes un bloque de entrenamiento activo.</p>
                                <Button variant="outline" onClick={() => onNavigate('/training')}>Crear o Buscar Plan</Button>
                            </CardContent>
                        </Card>
                    );
                })()}
            </section>
        </div>
    );
};