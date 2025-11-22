import React from 'react';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Déconnexion réussie');
            navigate('/login');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'Administrateur', color: 'badge-danger', icon: '👑' },
            pasteur: { label: 'Pasteur', color: 'badge-primary', icon: '🙏' },
            media: { label: 'Équipe Média', color: 'badge-success', icon: '📹' }
        };
        return badges[role] || badges.media;
    };

    const roleBadge = getRoleBadge(user?.role);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-600 mt-1">
                    Gérez vos informations personnelles
                </p>
            </div>

            {/* Profile Card */}
            <div className="card">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0">
                        {user?.photoUrl ? (
                            <img
                                src={user.photoUrl}
                                alt={user.displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold text-3xl">
                                {user?.displayName?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {user?.displayName}
                            </h2>
                            <span className={`badge ${roleBadge.color}`}>
                                {roleBadge.icon} {roleBadge.label}
                            </span>
                        </div>
                        <p className="text-gray-600 flex items-center gap-2 mb-4">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </p>

                        {user?.createdAt && (
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Membre depuis le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permissions et accès
                </h3>

                <div className="space-y-3">
                    {user?.role === 'admin' && (
                        <>
                            <PermissionItem
                                label="Gestion complète de la plateforme"
                                description="Accès à toutes les fonctionnalités d'administration"
                                granted={true}
                            />
                            <PermissionItem
                                label="Gestion des utilisateurs"
                                description="Inviter, modifier et supprimer des utilisateurs"
                                granted={true}
                            />
                            <PermissionItem
                                label="Statistiques avancées"
                                description="Accès aux rapports et statistiques détaillées"
                                granted={true}
                            />
                        </>
                    )}

                    <PermissionItem
                        label="Gestion des audios"
                        description="Créer, modifier et supprimer des fichiers audio"
                        granted={true}
                    />
                    <PermissionItem
                        label="Gestion des sermons"
                        description="Créer, modifier et supprimer des sermons"
                        granted={true}
                    />
                    <PermissionItem
                        label="Gestion des événements"
                        description="Créer, modifier et supprimer des événements"
                        granted={true}
                    />
                    <PermissionItem
                        label="Gestion des publications"
                        description="Créer, modifier et supprimer des publications"
                        granted={true}
                    />
                    <PermissionItem
                        label="Contrôle du LIVE"
                        description="Démarrer et arrêter les diffusions en direct"
                        granted={true}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Actions
                </h3>

                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>
            </div>

            {/* System Info */}
            <div className="card bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Informations système
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">ID Utilisateur</p>
                        <p className="font-mono text-gray-900">{user?.uid}</p>
                    </div>
                    {user?.lastLogout && (
                        <div>
                            <p className="text-gray-600">Dernière déconnexion</p>
                            <p className="text-gray-900">
                                {format(new Date(user.lastLogout), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PermissionItem = ({ label, description, granted }) => {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                granted ? 'bg-green-100' : 'bg-gray-200'
            }`}>
                {granted && (
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default ProfilePage;