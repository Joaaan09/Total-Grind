import React, { useState } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from './ui';
import { User as UserIcon, Mail, Shield, Loader2, Save, X, Camera, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TrainingService } from '../services/mockService';
import { ChangePasswordModal } from './ChangePasswordModal';

interface ProfileProps {
    user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
    const { token, refreshUser } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);

    // Estados para editar el nombre del usuario
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const [isSavingName, setIsSavingName] = useState(false);

    // Estado para el modal de cambio de contraseña
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Estados para subir imagen de perfil
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Estado para mostrar mensajes de éxito o error en la subida
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Estado para eliminar entrenador
    const [isRemovingCoach, setIsRemovingCoach] = useState(false);
    const [showRemoveCoachConfirm, setShowRemoveCoachConfirm] = useState(false);

    React.useEffect(() => {
        const loadInvites = async () => {
            if (token && user.role === 'athlete' && !user.coachId) {
                const data = await TrainingService.getInvites(token);
                setInvites(data);
            }
        };
        loadInvites();
    }, [token, user]);

    const handleAcceptInvite = async (coachId: string) => {
        if (!token) return;
        const success = await TrainingService.acceptInvite(token, coachId);
        if (success) {
            if (refreshUser) await refreshUser();
            window.location.reload();
        }
    };

    const handleRejectInvite = async (coachId: string) => {
        if (!token) return;
        const success = await TrainingService.rejectInvite(token, coachId);
        if (success) {
            setInvites(prev => prev.filter(i => i.coachId !== coachId));
        }
    };

    const handleSaveName = async () => {
        if (!token || !editName.trim()) return;
        setIsSavingName(true);
        try {
            const success = await TrainingService.updateProfile(token, { name: editName });
            if (success) {
                if (refreshUser) await refreshUser();
                setIsEditingName(false);
            }
        } catch (error) {
            console.error('Error updating name', error);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleRemoveCoach = async () => {
        if (!token) return;
        setIsRemovingCoach(true);
        try {
            const success = await TrainingService.removeCoach(token);
            if (success) {
                if (refreshUser) await refreshUser();
                setShowRemoveCoachConfirm(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error removing coach', error);
        } finally {
            setIsRemovingCoach(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploadStatus(null);
        setIsUploadingImage(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Comprimir a JPEG con calidad 0.7 y subir como Blob
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        setUploadStatus({ type: 'error', message: "Error al procesar imagen." });
                        setIsUploadingImage(false);
                        return;
                    }

                    try {
                        const result = await TrainingService.uploadAvatar(token, blob);
                        if (result.success) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                            if (refreshUser) await refreshUser();
                            setUploadStatus({ type: 'success', message: "Foto actualizada." });
                            setTimeout(() => setUploadStatus(null), 3000);
                        } else {
                            setUploadStatus({ type: 'error', message: "Error del servidor." });
                        }
                    } catch (error) {
                        setUploadStatus({ type: 'error', message: "Error de conexión." });
                    } finally {
                        setIsUploadingImage(false);
                    }
                }, 'image/jpeg', 0.7);
            };
        };
    };

    const handleDeleteAvatar = async () => {
        if (!token) return;
        setIsDeletingImage(true);
        setUploadStatus(null);

        try {
            const success = await TrainingService.deleteAvatar(token);
            if (success) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (refreshUser) await refreshUser();
                setUploadStatus({ type: 'success', message: "Foto eliminada." });
                setTimeout(() => setUploadStatus(null), 3000);
            } else {
                setUploadStatus({ type: 'error', message: "Error al eliminar foto." });
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: "Error de conexión." });
        } finally {
            setIsDeletingImage(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-50">Perfil de Usuario</h1>

                {/* Tarjeta de perfil principal */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="relative group flex-shrink-0">
                                <div className="h-12 sm:h-16 w-12 sm:w-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-700">
                                {user.profilePicture ? (
                                    <img
                                        key={`${user.profilePicture}-${user.profilePicture}`}
                                        src={user.profilePicture}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <UserIcon size={24} className="hidden sm:block" />
                                        <UserIcon size={20} className="sm:hidden" />
                                    </>
                                )}
                                </div>
                                <button
                                    className="absolute bottom-0 right-0 bg-brandRed-600 rounded-full p-0.5 sm:p-1 text-slate-50 shadow-lg hover:bg-brandRed-500 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingImage || isDeletingImage}
                                >
                                    {isUploadingImage ? (
                                        <>
                                            <Loader2 size={10} className="hidden sm:block animate-spin" />
                                            <Loader2 size={8} className="sm:hidden animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            <Camera size={10} className="hidden sm:block" />
                                            <Camera size={8} className="sm:hidden" />
                                        </>
                                    )}
                                </button>
                                {user.profilePicture && (
                                    <button
                                        className="absolute bottom-0 -left-1 bg-slate-900 border border-slate-700 rounded-full p-0.5 sm:p-1 text-slate-400 shadow-lg hover:text-red-500 hover:border-red-900/50 hover:bg-red-900/20 transition-colors"
                                        onClick={handleDeleteAvatar}
                                        disabled={isDeletingImage || isUploadingImage}
                                        title="Eliminar foto"
                                    >
                                        {isDeletingImage ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle>{user.name}</CardTitle>
                                <p className="text-slate-500 text-sm sm:text-base truncate">{user.email}</p>
                                {uploadStatus && (
                                    <p className={`text-xs font-bold mt-1 ${uploadStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {uploadStatus.message}
                                    </p>
                                )}
                            </div>
                            <Badge variant={user.role === 'coach' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                                {user.role === 'athlete' ? '🏋️ Atleta' : user.role === 'coach' ? '👨‍🏫 Entrenador' : '🛡️ Admin'}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Información del entrenador o invitaciones pendientes para atletas */}
                {user.role === 'athlete' && (
                    <>
                        {/* Entrenador activo */}
                        {user.coachId && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Shield size={20} className="text-brandRed-500" /> Mi Entrenador
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-900 rounded-lg border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            {typeof user.coachId === 'object' && user.coachId.profilePicture ? (
                                                <img
                                                    src={user.coachId.profilePicture}
                                                    alt={user.coachId.name}
                                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-brandRed-900/30 text-brandRed-500 flex items-center justify-center font-bold flex-shrink-0">
                                                    {typeof user.coachId === 'object' ? user.coachId.name.substring(0, 2).toUpperCase() : 'EC'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-50 truncate">
                                                    {typeof user.coachId === 'object' ? user.coachId.name : 'Tu Entrenador'}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {typeof user.coachId === 'object' ? user.coachId.email : 'Conectado'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowRemoveCoachConfirm(true)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                                            title="Eliminar entrenador"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invitaciones pendientes */}
                        {!user.coachId && invites.length > 0 && (
                            <Card className="border-slate-700 bg-brandRed-950/10">
                                <CardHeader>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Mail size={20} className="text-brandRed-500" /> Invitaciones Pendientes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {invites.map(invite => (
                                        <div key={invite._id || invite.coachId} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                                            <div>
                                                <p className="font-medium text-slate-50">{invite.coachName}</p>
                                                <p className="text-xs text-slate-400">Quiere ser tu entrenador</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 hover:text-red-300 border-slate-700"
                                                    onClick={() => handleRejectInvite(invite.coachId)}
                                                >
                                                    Rechazar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-brandRed-600 hover:bg-brandRed-700 text-slate-50 border-none"
                                                    onClick={() => handleAcceptInvite(invite.coachId)}
                                                >
                                                    Aceptar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Configuración */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Configuración</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-9 flex-1"
                                    placeholder="Nuevo nombre"
                                />
                                <Button size="sm" onClick={handleSaveName} disabled={isSavingName} className="h-9 px-3">
                                    {isSavingName ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setEditName(user.name); }} disabled={isSavingName} className="h-9 px-3 text-red-500">
                                    <X size={16} />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" className="w-full justify-between" onClick={() => { setEditName(user.name); setIsEditingName(true); }}>
                                Cambiar Nombre de Usuario
                                <ArrowRightIcon />
                            </Button>
                        )}
                        <Button variant="outline" className="w-full justify-between" onClick={() => setIsPasswordModalOpen(true)}>
                            Cambiar Contraseña
                            <ArrowRightIcon />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de confirmación para eliminar entrenador */}
            {showRemoveCoachConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <UserMinus className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Eliminar Entrenador</h3>
                        </div>
                        <p className="text-slate-50 mb-6">
                            ¿Estás seguro de que quieres dejar de entrenar con{' '}
                            <strong className="text-slate-50">
                                {typeof user.coachId === 'object' ? user.coachId.name : 'tu entrenador'}
                            </strong>
                            ? Ya no tendrá acceso a tu progreso y dejará de poder asignarte bloques.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setShowRemoveCoachConfirm(false)}
                                disabled={isRemovingCoach}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleRemoveCoach}
                                disabled={isRemovingCoach}
                            >
                                {isRemovingCoach ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Eliminando...
                                    </>
                                ) : (
                                    'Eliminar Entrenador'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </>
    );
};

const ArrowRightIcon = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>;