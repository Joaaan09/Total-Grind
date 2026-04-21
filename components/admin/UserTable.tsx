import React from 'react';
import { Users, Plus, Eye } from 'lucide-react';
import { UserListItem } from '../../types';

interface UserTableProps {
    users: UserListItem[];
    onViewDetail: (userId: string) => void;
    onCreateUser: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onViewDetail, onCreateUser }) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-semibold text-slate-50 flex items-center gap-2">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5" />
                    Usuarios
                </h2>
                <button
                    onClick={onCreateUser}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-brandRed-500 hover:bg-brandRed-600 rounded-lg transition-colors text-xs sm:text-sm text-slate-50"
                >
                    <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Crear Usuario</span>
                    <span className="sm:hidden">Crear</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-slate-50">Usuario</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-slate-50 hidden md:table-cell">Email</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-slate-50">Rol</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-slate-50 hidden md:table-cell">Registro</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-slate-50"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-50 text-xs sm:text-sm font-medium flex-shrink-0">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-slate-50 font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-50 text-sm hidden md:table-cell">{user.email}</td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${user.role === 'admin'
                                        ? 'bg-yellow-500/20 text-amber-500'
                                        : user.role === 'coach'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-green-500/20 text-emerald-500'
                                        }`}>
                                        {user.role === 'admin' ? 'Admin' : user.role === 'coach' ? 'Coach' : 'Atleta'}
                                    </span>
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-400 text-sm hidden md:table-cell">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                                    <button
                                        onClick={() => onViewDetail(user._id)}
                                        className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Ver detalle"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    No hay usuarios registrados
                </div>
            )}
        </div>
    );
};
