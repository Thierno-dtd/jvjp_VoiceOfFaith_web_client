import React, { useState, useEffect } from 'react';
import { Plus, Music, Search, Filter, Download, Play, Trash2, Edit, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { audioService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AudioModal from '../../components/audios/AudioModal';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AudiosPage = () => {
    const { user } = useAuthStore();
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAudio, setEditingAudio] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const categories = [
        { value: 'all', label: 'Tous' },
        { value: 'emission', label: 'Émissions' },
        { value: 'podcast', label: 'Podcasts' },
        { value: 'teaching', label: 'Enseignements' }
    ];

    useEffect(() => {
        fetchAudios();
    }, [selectedCategory, page]);

    const fetchAudios = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(selectedCategory !== 'all' && { category: selectedCategory })
            };
            const response = await audioService.getAllAudios(params);

            if (page === 1) {
                setAudios(response.data.audios);
            } else {
                setAudios(prev => [...prev, ...response.data.audios]);
            }

            setHasMore(response.data.audios.length === 20);
        } catch (error) {
            toast.error('Erreur lors du chargement des audios');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet audio ?')) return;

        try {
            await audioService.deleteAudio(id);
            setAudios(audios.filter(a => a.id !== id));
            toast.success('Audio supprimé avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const handleEdit = (audio) => {
        setEditingAudio(audio);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingAudio(null);
        fetchAudios();
    };

    const filteredAudios = audios.filter(audio =>
        audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audio.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (category) => {
        const colors = {
            emission: 'bg-blue-100 text-blue-800',
            podcast: 'bg-purple-100 text-purple-800',
            teaching: 'bg-green-100 text-green-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            emission: 'Émission',
            podcast: 'Podcast',
            teaching: 'Enseignement'
        };
        return labels[category] || category;
    };

    if (loading && page === 1) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Audios</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les fichiers audio de la plateforme
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvel audio
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un audio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Category filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setPage(1);
                            }}
                            className="input"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
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
                            <p className="text-2xl font-bold text-gray-900">{audios.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Music className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Émissions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {audios.filter(a => a.category === 'emission').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Music className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Podcasts</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {audios.filter(a => a.category === 'podcast').length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Music className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Enseignements</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {audios.filter(a => a.category === 'teaching').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Music className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAudios.map((audio) => (
                    <div key={audio.id} className="card-hover group">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-4 overflow-hidden">
                            {audio.thumbnailUrl ? (
                                <img
                                    src={audio.thumbnailUrl}
                                    alt={audio.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Music className="w-12 h-12 text-white opacity-50" />
                                </div>
                            )}

                            {/* Category badge */}
                            <div className="absolute top-2 left-2">
                                <span className={`badge ${getCategoryColor(audio.category)}`}>
                                    {getCategoryLabel(audio.category)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(audio)}
                                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
                                    >
                                        <Edit className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(audio.id)}
                                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {audio.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {audio.description || 'Pas de description'}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Play className="w-4 h-4" />
                                        {audio.plays || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Download className="w-4 h-4" />
                                        {audio.downloads || 0}
                                    </span>
                                </div>
                                <span className="text-xs">
                                    {format(new Date(audio.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </span>
                            </div>

                            {/* Audio player */}
                            <audio controls className="w-full">
                                <source src={audio.audioUrl} type="audio/mpeg" />
                                Votre navigateur ne supporte pas l'élément audio.
                            </audio>

                            {/* Uploader */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Par {audio.uploadedByName}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredAudios.length === 0 && !loading && (
                <div className="card text-center py-12">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun audio trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par ajouter votre premier audio'}
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Ajouter un audio
                        </button>
                    )}
                </div>
            )}

            {/* Load more */}
            {hasMore && !loading && filteredAudios.length > 0 && (
                <div className="text-center">
                    <button
                        onClick={() => setPage(p => p + 1)}
                        className="btn-secondary"
                    >
                        Charger plus
                    </button>
                </div>
            )}

            {/* Loading more */}
            {loading && page > 1 && (
                <div className="text-center py-4">
                    <LoadingSpinner size="md" />
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <AudioModal
                    audio={editingAudio}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default AudiosPage;