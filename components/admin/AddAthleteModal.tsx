import React from 'react';
import { UserPlus, X } from 'lucide-react';

interface AddAthleteModalProps {
    availableAthletes: any[];
    onClose: () => void;
    onAddAthlete: (athleteId: string) => void;
}

export const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ availableAthletes, onClose, onAddAthlete }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                        Añadir Atleta
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                {availableAthletes.length > 0 ? (
                    <div className="space-y-2">
                        {availableAthletes.map(athlete => (
                            <button
                                key={athlete._id}
                                onClick={() => onAddAthlete(athlete._id)}
                                className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                {athlete.profilePicture ? (
                                    <img
                                        src={athlete.profilePicture}
                                        alt={athlete.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-slate-50 font-medium">
                                        {athlete.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-slate-50 font-medium">{athlete.name}</p>
                                    <p className="text-xs text-slate-400">{athlete.email}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">
                        No hay atletas disponibles sin entrenador
                    </p>
                )}
            </div>
        </div>
    );
};
