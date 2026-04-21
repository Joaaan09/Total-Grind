import React from 'react';
import { Users, X, Check, Edit2, Lock, Trash2, UserPlus, Dumbbell, BarChart3, Plus, ChevronDown, ChevronRight, ExternalLink, UserMinus } from 'lucide-react';
import { LiftCard } from './LiftCard';
import { UserDetail } from '../../types';

interface UserDetailModalProps {
    selectedUser: UserDetail;
    editMode: boolean;
    setEditMode: (mode: boolean) => void;
    editData: any;
    setEditData: (data: any) => void;
    onClose: () => void;
    onUpdateUser: () => void;
    onDeleteClick: () => void;
    onChangePasswordClick: () => void;
    coachAthletes: any[];
    onOpenAddAthlete: () => void;
    onRemoveAthlete: (id: string) => void;
    expandedBlocks: Set<string>;
    toggleBlockExpand: (id: string) => void;
    onOpenCreateBlock: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    selectedUser,
    editMode,
    setEditMode,
    editData,
    setEditData,
    onClose,
    onUpdateUser,
    onDeleteClick,
    onChangePasswordClick,
    coachAthletes,
    onOpenAddAthlete,
    onRemoveAthlete,
    expandedBlocks,
    toggleBlockExpand,
    onOpenCreateBlock
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-50">
                        {editMode ? 'Editar Usuario' : 'Detalle de Usuario'}
                    </h3>
                    <button
                        onClick={() => {
                            onClose();
                            setEditMode(false);
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Información del usuario */}
                    <div className="bg-slate-700/50 rounded-xl p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                {selectedUser.user.profilePicture ? (
                                    <img
                                        src={selectedUser.user.profilePicture}
                                        alt={selectedUser.user.name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-600 flex items-center justify-center text-xl sm:text-2xl text-slate-50 font-medium flex-shrink-0">
                                        {selectedUser.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {editMode ? (
                                    <div className="space-y-2 flex-1">
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="bg-slate-600 text-slate-50 px-3 py-1.5 rounded-lg w-full"
                                            placeholder="Nombre"
                                        />
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="bg-slate-600 text-slate-50 px-3 py-1.5 rounded-lg w-full"
                                            placeholder="Email"
                                        />
                                        <select
                                            value={editData.role}
                                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                            className="bg-slate-600 text-slate-50 px-3 py-1.5 rounded-lg w-full"
                                        >
                                            <option value="athlete">Atleta</option>
                                            <option value="coach">Entrenador</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="min-w-0">
                                        <h4 className="text-lg sm:text-xl font-bold text-slate-50 truncate">{selectedUser.user.name}</h4>
                                        <p className="text-sm text-slate-400 truncate">{selectedUser.user.email}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.user.role === 'admin'
                                            ? 'bg-yellow-500/20 text-amber-500'
                                            : selectedUser.user.role === 'coach'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-green-500/20 text-emerald-500'
                                            }`}>
                                            {selectedUser.user.role === 'admin' ? 'Admin' : selectedUser.user.role === 'coach' ? 'Entrenador' : 'Atleta'}
                                        </span>
                                        {selectedUser.user.coachId && (
                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                <Users className="w-4 h-4 text-purple-400" />
                                                <span className="text-slate-400">Entrenador:</span>
                                                <span className="text-slate-50 font-medium">
                                                    {typeof selectedUser.user.coachId === 'object'
                                                        ? selectedUser.user.coachId.name
                                                        : selectedUser.user.coachId}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedUser.user.role !== 'admin' && (
                                <div className="flex gap-2 sm:self-start w-full sm:w-auto justify-end mt-2 sm:mt-0 border-t sm:border-0 border-slate-600/50 pt-3 sm:pt-0">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={onUpdateUser}
                                                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                            >
                                                <Check className="w-4 h-4 text-slate-50" />
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-slate-50" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className="p-2 bg-brandRed-500 hover:bg-brandRed-600 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4 text-slate-50" />
                                            </button>
                                            <button
                                                onClick={onChangePasswordClick}
                                                className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                                                title="Cambiar contraseña"
                                            >
                                                <Lock className="w-4 h-4 text-slate-50" />
                                            </button>
                                            <button
                                                onClick={onDeleteClick}
                                                className="p-2 border border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de Atletas (solo para coaches) */}
                    {selectedUser.user.role === 'coach' && (
                        <div className="bg-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    Atletas ({coachAthletes.length})
                                </h4>
                                <button
                                    onClick={onOpenAddAthlete}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors text-sm text-slate-50"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Añadir
                                </button>
                            </div>
                            {coachAthletes.length > 0 ? (
                                <div className="space-y-2">
                                    {coachAthletes.map(athlete => (
                                        <div key={athlete._id} className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {athlete.profilePicture ? (
                                                    <img
                                                        src={athlete.profilePicture}
                                                        alt={athlete.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-slate-50 font-medium">
                                                        {athlete.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-slate-50 font-medium">{athlete.name}</p>
                                                    <p className="text-xs text-slate-400">{athlete.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemoveAthlete(athlete._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Quitar atleta"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-4">
                                    Este entrenador no tiene atletas asignados
                                </p>
                            )}
                        </div>
                    )}

                    {/* Mejores marcas */}
                    <div className="bg-slate-700/50 rounded-xl p-4">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-50 mb-3 sm:mb-4 flex items-center gap-2">
                            <Dumbbell className="w-4 sm:w-5 h-4 sm:h-5 text-brandRed-500" />
                            Mejores Marcas
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                            <LiftCard title="Squat" data={selectedUser.bestLifts['Comp SQ']} />
                            <LiftCard title="Bench" data={selectedUser.bestLifts['Comp BP']} />
                            <LiftCard title="Deadlift" data={selectedUser.bestLifts['Comp DL']} />
                            <LiftCard title="Total" data={selectedUser.bestLifts['Total']} isTotal />
                        </div>
                    </div>

                    {/* Bloques de entrenamiento */}
                    <div className="bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-500" />
                                Bloques de Entrenamiento ({selectedUser.blocks.length})
                            </h4>
                            <button
                                onClick={onOpenCreateBlock}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-sm text-slate-50"
                            >
                                <Plus className="w-4 h-4" />
                                Crear Bloque
                            </button>
                        </div>
                        {selectedUser.blocks.length > 0 ? (
                            <div className="space-y-2">
                                {selectedUser.blocks.map(block => (
                                    <div key={block.id} className="bg-slate-600/50 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleBlockExpand(block.id)}
                                            className="w-full p-3 flex items-center justify-between hover:bg-slate-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedBlocks.has(block.id) ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                )}
                                                <span className="text-slate-50 font-medium">{block.title}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${block.source === 'assigned'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-slate-800 text-brandRed-500'
                                                    }`}>
                                                    {block.source === 'assigned' ? 'Asignado' : 'Personal'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.hash = `/training/${block.id}`;
                                                        onClose();
                                                    }}
                                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="Editar bloque"
                                                >
                                                    <ExternalLink className="w-3 h-3 text-slate-50" />
                                                </button>
                                                <span className="text-slate-400 text-sm">
                                                    {block.weeks.length} semanas
                                                </span>
                                            </div>
                                        </button>

                                        {expandedBlocks.has(block.id) && (
                                            <div className="px-3 pb-3 border-t border-slate-500/50">
                                                {block.weeks.map((week, weekIdx) => (
                                                    <div key={week.id} className="mt-2">
                                                        <p className="text-slate-50 text-sm font-medium mb-1">
                                                            Semana {weekIdx + 1}
                                                        </p>
                                                        <div className="pl-4 space-y-1">
                                                            {week.days.map((day, dayIdx) => (
                                                                <div key={day.id} className="flex items-center gap-2 text-sm">
                                                                    <span className={`w-2 h-2 rounded-full ${day.isCompleted ? 'bg-green-400' : 'bg-slate-500'
                                                                        }`} />
                                                                    <span className="text-slate-400">
                                                                        {day.dayName} - {day.exercises.length} ejercicios
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">
                                Este usuario no tiene bloques de entrenamiento
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
