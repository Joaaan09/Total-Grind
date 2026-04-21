import { useState, useEffect } from 'react';
import { TrainingService } from '../services/apiService';
import { UserListItem, AdminStats, UserDetail } from '../types';

export const useAdminDashboard = (token: string) => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', role: '' });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

    // Estados para gestión de atletas de coach
    const [coachAthletes, setCoachAthletes] = useState<any[]>([]);
    const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
    const [availableAthletes, setAvailableAthletes] = useState<any[]>([]);

    // Estados para crear bloque
    const [showCreateBlockModal, setShowCreateBlockModal] = useState(false);
    const [newBlockTitle, setNewBlockTitle] = useState('');
    const [creatingBlock, setCreatingBlock] = useState(false);

    // Estados para crear usuario
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'athlete' });
    const [creatingUser, setCreatingUser] = useState(false);
    const [createUserError, setCreateUserError] = useState<string | null>(null);

    // Estados para cambiar contraseña de usuario
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
    const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        const [statsData, usersData] = await Promise.all([
            TrainingService.getAdminStats(token),
            TrainingService.getAllUsers(token)
        ]);
        if (statsData) setStats(statsData);
        setUsers(usersData);
        setLoading(false);
    };

    const viewUserDetail = async (userId: string) => {
        const detail = await TrainingService.getUserDetail(token, userId);
        if (detail) {
            setSelectedUser(detail);
            setEditData({
                name: detail.user.name,
                email: detail.user.email,
                role: detail.user.role
            });
            setShowUserModal(true);

            // Si es coach, cargar sus atletas
            if (detail.user.role === 'coach') {
                const athletes = await TrainingService.getCoachAthletes(token, userId);
                setCoachAthletes(athletes);
            } else {
                setCoachAthletes([]);
            }
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        const success = await TrainingService.updateUser(token, selectedUser.user._id, editData);
        if (success) {
            setEditMode(false);
            await loadData();
            setSelectedUser({
                ...selectedUser,
                user: { ...selectedUser.user, ...editData }
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const success = await TrainingService.deleteUser(token, userId);
        if (success) {
            setConfirmDelete(null);
            setShowUserModal(false);
            await loadData();
        }
    };

    const handleChangePassword = async () => {
        if (!selectedUser || !newPassword.trim() || !confirmPassword.trim()) {
            setChangePasswordError('Por favor completa todos los campos');
            return;
        }
        if (newPassword !== confirmPassword) {
            setChangePasswordError('Las contraseñas no coinciden');
            return;
        }
        if (newPassword.length < 6) {
            setChangePasswordError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setChangingPassword(true);
        setChangePasswordError(null);
        setChangePasswordSuccess(null);

        const success = await TrainingService.changeUserPassword(token, selectedUser.user._id, newPassword);
        if (success) {
            setChangePasswordSuccess('Contraseña actualizada correctamente');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowChangePasswordModal(false);
                setChangePasswordSuccess(null);
            }, 2000);
        } else {
            setChangePasswordError('Error al cambiar la contraseña');
        }
        setChangingPassword(false);
    };

    const toggleBlockExpand = (blockId: string) => {
        const newExpanded = new Set(expandedBlocks);
        if (newExpanded.has(blockId)) {
            newExpanded.delete(blockId);
        } else {
            newExpanded.add(blockId);
        }
        setExpandedBlocks(newExpanded);
    };

    const openAddAthleteModal = async () => {
        const available = await TrainingService.getAvailableAthletes(token);
        setAvailableAthletes(available);
        setShowAddAthleteModal(true);
    };

    const handleAddAthlete = async (athleteId: string) => {
        if (!selectedUser) return;
        const success = await TrainingService.assignAthleteToCoach(token, selectedUser.user._id, athleteId);
        if (success) {
            const athletes = await TrainingService.getCoachAthletes(token, selectedUser.user._id);
            setCoachAthletes(athletes);
            setShowAddAthleteModal(false);
        }
    };

    const handleRemoveAthlete = async (athleteId: string) => {
        if (!selectedUser) return;
        const success = await TrainingService.removeAthleteFromCoach(token, selectedUser.user._id, athleteId);
        if (success) {
            setCoachAthletes(prev => prev.filter(a => a._id !== athleteId));
        }
    };

    const handleCreateBlock = async () => {
        if (!selectedUser || !newBlockTitle.trim()) return;
        setCreatingBlock(true);
        const block = await TrainingService.createBlockForUser(token, selectedUser.user._id, newBlockTitle);
        if (block) {
            const detail = await TrainingService.getUserDetail(token, selectedUser.user._id);
            if (detail) {
                setSelectedUser(detail);
            }
            setShowCreateBlockModal(false);
            setNewBlockTitle('');
        }
        setCreatingBlock(false);
    };

    const handleCreateUser = async () => {
        if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password.trim()) {
            setCreateUserError('Todos los campos son requeridos');
            return;
        }
        if (newUserData.password.length < 6) {
            setCreateUserError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setCreatingUser(true);
        setCreateUserError(null);
        const result = await TrainingService.createUser(token, newUserData);
        if (result.success) {
            setShowCreateUserModal(false);
            setNewUserData({ name: '', email: '', password: '', role: 'athlete' });
            await loadData();
        } else {
            setCreateUserError(result.error || 'Error al crear usuario');
        }
        setCreatingUser(false);
    };

    return {
        stats,
        users,
        loading,
        selectedUser,
        setSelectedUser,
        showUserModal,
        setShowUserModal,
        editMode,
        setEditMode,
        editData,
        setEditData,
        confirmDelete,
        setConfirmDelete,
        expandedBlocks,
        coachAthletes,
        showAddAthleteModal,
        setShowAddAthleteModal,
        availableAthletes,
        showCreateBlockModal,
        setShowCreateBlockModal,
        newBlockTitle,
        setNewBlockTitle,
        creatingBlock,
        showCreateUserModal,
        setShowCreateUserModal,
        newUserData,
        setNewUserData,
        creatingUser,
        createUserError,
        setCreateUserError,
        showChangePasswordModal,
        setShowChangePasswordModal,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        changingPassword,
        changePasswordError,
        setChangePasswordError,
        changePasswordSuccess,
        setChangePasswordSuccess,
        viewUserDetail,
        handleUpdateUser,
        handleDeleteUser,
        handleChangePassword,
        toggleBlockExpand,
        openAddAthleteModal,
        handleAddAthlete,
        handleRemoveAthlete,
        handleCreateBlock,
        handleCreateUser
    };
};
