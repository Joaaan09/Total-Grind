import React from 'react';
import { Users, BarChart3, Dumbbell, RefreshCw } from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import {
    StatCard,
    UserTable,
    ConfirmDeleteModal,
    CreateUserModal,
    AddAthleteModal,
    ChangePasswordModal,
    AdminCreateBlockModal,
    UserDetailModal
} from './admin';

interface AdminDashboardProps {
    token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
    const admin = useAdminDashboard(token);

    if (admin.loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="p-1 sm:p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header con estadísticas */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-50 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <BarChart3 className="w-5 sm:w-8 h-5 sm:h-8 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Panel de Admin</span>
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <StatCard
                        title="Total Usuarios"
                        value={admin.stats?.totalUsers || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Atletas"
                        value={admin.stats?.totalAthletes || 0}
                        icon={<Dumbbell className="w-6 h-6" />}
                        color="green"
                    />
                    <StatCard
                        title="Entrenadores"
                        value={admin.stats?.totalCoaches || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Bloques"
                        value={admin.stats?.totalBlocks || 0}
                        icon={<BarChart3 className="w-6 h-6" />}
                        color="orange"
                    />
                </div>
            </div>

            {/* Lista de usuarios */}
            <UserTable
                users={admin.users}
                onViewDetail={admin.viewUserDetail}
                onCreateUser={() => admin.setShowCreateUserModal(true)}
            />

            {/* Modales */}
            {admin.showUserModal && admin.selectedUser && (
                <UserDetailModal
                    selectedUser={admin.selectedUser}
                    editMode={admin.editMode}
                    setEditMode={admin.setEditMode}
                    editData={admin.editData}
                    setEditData={admin.setEditData}
                    onClose={() => admin.setShowUserModal(false)}
                    onUpdateUser={admin.handleUpdateUser}
                    onDeleteClick={() => admin.setConfirmDelete(admin.selectedUser!.user._id)}
                    onChangePasswordClick={() => {
                        admin.setNewPassword('');
                        admin.setConfirmPassword('');
                        admin.setChangePasswordError(null);
                        admin.setChangePasswordSuccess(null);
                        admin.setShowChangePasswordModal(true);
                    }}
                    coachAthletes={admin.coachAthletes}
                    onOpenAddAthlete={admin.openAddAthleteModal}
                    onRemoveAthlete={admin.handleRemoveAthlete}
                    expandedBlocks={admin.expandedBlocks}
                    toggleBlockExpand={admin.toggleBlockExpand}
                    onOpenCreateBlock={() => admin.setShowCreateBlockModal(true)}
                />
            )}

            {admin.confirmDelete && (
                <ConfirmDeleteModal
                    onConfirm={() => admin.handleDeleteUser(admin.confirmDelete!)}
                    onCancel={() => admin.setConfirmDelete(null)}
                />
            )}

            {admin.showAddAthleteModal && (
                <AddAthleteModal
                    availableAthletes={admin.availableAthletes}
                    onClose={() => admin.setShowAddAthleteModal(false)}
                    onAddAthlete={admin.handleAddAthlete}
                />
            )}

            {admin.showCreateBlockModal && admin.selectedUser && (
                <AdminCreateBlockModal
                    selectedUser={admin.selectedUser}
                    newBlockTitle={admin.newBlockTitle}
                    setNewBlockTitle={admin.setNewBlockTitle}
                    creatingBlock={admin.creatingBlock}
                    onClose={() => admin.setShowCreateBlockModal(false)}
                    onCreate={admin.handleCreateBlock}
                />
            )}

            {admin.showCreateUserModal && (
                <CreateUserModal
                    newUserData={admin.newUserData}
                    setNewUserData={admin.setNewUserData}
                    onClose={() => admin.setShowCreateUserModal(false)}
                    onCreate={admin.handleCreateUser}
                    creatingUser={admin.creatingUser}
                    error={admin.createUserError}
                />
            )}

            {admin.showChangePasswordModal && admin.selectedUser && (
                <ChangePasswordModal
                    selectedUser={admin.selectedUser}
                    newPassword={admin.newPassword}
                    setNewPassword={admin.setNewPassword}
                    confirmPassword={admin.confirmPassword}
                    setConfirmPassword={admin.setConfirmPassword}
                    changingPassword={admin.changingPassword}
                    error={admin.changePasswordError}
                    success={admin.changePasswordSuccess}
                    onClose={() => admin.setShowChangePasswordModal(false)}
                    onChangePassword={admin.handleChangePassword}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
