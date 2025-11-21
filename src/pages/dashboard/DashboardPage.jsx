import React, { useEffect, useState } from 'react';
import {
    Users,
    Music,
    BookOpen,
    Calendar,
    TrendingUp,
    Download,
    Play,
    Heart,
    Eye
} from 'lucide-react';
import { statsService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await statsService.getOverview();
            setStats(response.data.stats);
        } catch (error) {
            toast.error('Erreur lors du chargement des statistiques');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Utilisateurs',
            value: stats?.users?.total || 0,
            icon: Users,
            color: 'bg-blue-500',
            change: `+${stats?.growth?.newUsersLast30Days || 0} ce mois`,
            details: [
                { label: 'Admin', value: stats?.users?.admin || 0 },
                { label: 'Pasteur', value: stats?.users?.pasteur || 0 },
                { label: 'Média', value: stats?.users?.media || 0 },
                { label: 'Users', value: stats?.users?.user || 0 }
            ]
        },
        {
            title: 'Audios',
            value: stats?.content?.audios || 0,
            icon: Music,
            color: 'bg-purple-500',
            change: `+${stats?.growth?.newAudiosLast30Days || 0} ce mois`,
            details: [
                { label: 'Total écoutes', value: stats?.engagement?.totalPlays || 0 },
                { label: 'Téléchargements', value: stats?.engagement?.totalDownloads || 0 }
            ]
        },
        {
            title: 'Sermons',
            value: stats?.content?.sermons || 0,
            icon: BookOpen,
            color: 'bg-green-500',
            change: 'Disponibles',
            details: []
        },
        {
            title: 'Événements',
            value: stats?.content?.events || 0,
            icon: Calendar,
            color: 'bg-orange-500',
            change: 'Programmés',
            details: []
        }
    ];

    const engagementMetrics = [
        {
            label: 'Lectures totales',
            value: stats?.engagement?.totalPlays || 0,
            icon: Play,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            label: 'Téléchargements',
            value: stats?.engagement?.totalDownloads || 0,
            icon: Download,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            label: 'Moyenne / Audio',
            value: stats?.engagement?.avgPlaysPerAudio || 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            label: 'Publications',
            value: stats?.content?.posts || 0,
            icon: Eye,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Tableau de bord
                </h1>
                <p className="mt-2 text-gray-600">
                    Bienvenue, <span className="font-medium">{user?.displayName}</span>
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                {stat.change}
              </span>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                        </div>

                        {stat.details.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                {stat.details.map((detail, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{detail.label}</span>
                                        <span className="font-medium text-gray-900">{detail.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Engagement Metrics */}
            <div className="card">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Métriques d'engagement
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Statistiques d'utilisation de la plateforme
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {engagementMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{metric.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Activité récente
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {stats?.growth?.newUsersLast30Days || 0} nouveaux utilisateurs
                                    </p>
                                    <p className="text-xs text-gray-500">Ce mois-ci</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Music className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {stats?.growth?.newAudiosLast30Days || 0} nouveaux audios
                                    </p>
                                    <p className="text-xs text-gray-500">Ce mois-ci</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Actions rapides
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = '/audios'}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                        >
                            <Music className="w-6 h-6 text-primary-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Ajouter Audio</p>
                        </button>

                        <button
                            onClick={() => window.location.href = '/sermons'}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                        >
                            <BookOpen className="w-6 h-6 text-primary-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Ajouter Sermon</p>
                        </button>

                        <button
                            onClick={() => window.location.href = '/events'}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                        >
                            <Calendar className="w-6 h-6 text-primary-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Nouvel Événement</p>
                        </button>

                        <button
                            onClick={() => window.location.href = '/posts'}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                        >
                            <Eye className="w-6 h-6 text-primary-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Publication</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;