import React, { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Search, Filter, Trash2, Mail, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import InviteUserModal from '../../components/users/InviteUserModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const roles = [
        { value: 'all', label: 'Tous les rôles' },
        { value: 'admin', label: 'Administrateurs' },
        { value: 'pasteur', label: 'Pasteurs' },
        { value: 'media', label: 'Équipe média' },
        { value: 'user', label: 'Utilisateurs' }
    ];

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 100,
                ...(selectedRole !== 'all' && { role: selectedRole })
            };
            const response = await userService.getAllUsers(params);
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Erreur lors du chargement des utilisateurs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await userService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('Utilisateur supprimé avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const handleResendInvitation = async (id) => {
        try {
            await userService.resendInvitation(id);
            toast.success('Invitation renvoyée avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'envoi de l\'invitation');
            console.error(error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur en "${newRole}" ?`)) return;

        try {
            await userService.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success('Rôle modifié avec succès');
        } catch (error) {
            toast.error('Erreur lors de la modification du rôle');
            console.error(error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'Admin', color: 'badge-danger' },
            pasteur: { label: 'Pasteur', color: 'badge-primary' },
            media: { label: 'Média', color: 'badge-success' },
            user: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800' }
        };
        return badges[role] || badges.user;
    };

    const usersByRole = {
        admin: users.filter(u => u.role === 'admin').length,
        pasteur: users.filter(u => u.role === 'pasteur').length,
        media: users.filter(u => u.role === 'media').length,
        user: users.filter(u => u.role === 'user').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les utilisateurs et leurs permissions
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Inviter un utilisateur
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par email ou nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input"
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Administrateurs</p>
                            <p className="text-2xl font-bold text-gray-900">{usersByRole.admin}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pasteurs</p>
                            <p className="text-2xl font-bold text-gray-900">{usersByRole.pasteur}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Équipe média</p>
                            <p className="text-2xl font-bold text-gray-900">{usersByRole.media}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Rôle</th>
                            <th>Inscription</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => {
                            const roleBadge = getRoleBadge(user.role);
                            const needsReset = user.needsPasswordReset;

                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                                    <span className="text-primary-700 font-medium text-sm">
                                                        {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                                    </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.displayName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="text-sm border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value="user">Utilisateur</option>
                                            <option value="media">Média</option>
                                            <option value="pasteur">Pasteur</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="text-sm text-gray-600">
                                        {user.createdAt && format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td>
                                        {needsReset ? (
                                            <span className="badge badge-warning">
                                                    En attente
                                                </span>
                                        ) : (
                                            <span className="badge badge-success">
                                                    Actif
                                                </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {needsReset && (
                                                <button
                                                    onClick={() => handleResendInvitation(user.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Renvoyer l'invitation"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty state */}
            {filteredUsers.length === 0 && (
                <div className="card text-center py-12">
                    <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun utilisateur trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedRole !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par inviter votre premier utilisateur'}
                    </p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <InviteUserModal onClose={handleModalClose} />
            )}
        </div>
    );
};

export default UsersPage;