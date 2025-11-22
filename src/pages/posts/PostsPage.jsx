import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Video, Search, Filter, Trash2, Edit, Heart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { postService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PostModal from '../../components/posts/PostModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const categories = [
        { value: 'all', label: 'Toutes' },
        { value: 'pensee', label: 'Pensée du jour' },
        { value: 'pasteur', label: 'Pasteur' },
        { value: 'media', label: 'Média' }
    ];

    const types = [
        { value: 'all', label: 'Tous' },
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Vidéos' }
    ];

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, selectedType]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 50,
                page: 1,
                ...(selectedCategory !== 'all' && { category: selectedCategory })
            };
            const response = await postService.getAllPosts(params);
            setPosts(response.data.posts);
        } catch (error) {
            toast.error('Erreur lors du chargement des publications');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;

        try {
            await postService.deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
            toast.success('Publication supprimée avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        fetchPosts();
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || post.type === selectedType;
        return matchesSearch && matchesType;
    });

    const getCategoryColor = (category) => {
        const colors = {
            pensee: 'bg-blue-100 text-blue-800',
            pasteur: 'bg-purple-100 text-purple-800',
            media: 'bg-green-100 text-green-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            pensee: 'Pensée du jour',
            pasteur: 'Pasteur',
            media: 'Média'
        };
        return labels[category] || category;
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
                    <h1 className="text-3xl font-bold text-gray-900">Publications</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les publications sur les réseaux sociaux
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle publication
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une publication..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="input"
                        >
                            {types.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
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
                            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Vues totales</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {posts.reduce((acc, p) => acc + (p.views || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Eye className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">J'aime totaux</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {posts.reduce((acc, p) => acc + (p.likes || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Heart className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Images</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {posts.filter(p => p.type === 'image').length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="card-hover group">
                        {/* Media */}
                        <div className="relative aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            {post.type === 'image' ? (
                                <img
                                    src={post.mediaUrl}
                                    alt={post.content}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    src={post.mediaUrl}
                                    poster={post.thumbnailUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                />
                            )}

                            {/* Type badge */}
                            <div className="absolute top-2 left-2">
                                <span className="badge bg-black/50 text-white">
                                    {post.type === 'image' ? (
                                        <><ImageIcon className="w-3 h-3 mr-1" /> Image</>
                                    ) : (
                                        <><Video className="w-3 h-3 mr-1" /> Vidéo</>
                                    )}
                                </span>
                            </div>

                            {/* Category badge */}
                            <div className="absolute top-2 right-2">
                                <span className={`badge ${getCategoryColor(post.category)}`}>
                                    {getCategoryLabel(post.category)}
                                </span>
                            </div>

                            {/* Actions overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-3 bg-white rounded-lg hover:bg-gray-100"
                                >
                                    <Edit className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-3 bg-white rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <p className="text-sm text-gray-900 mb-3 line-clamp-3">
                                {post.content}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {post.views || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {post.likes || 0}
                                    </span>
                                </div>
                                <span className="text-xs">
                                    {format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}
                                </span>
                            </div>

                            {/* Author */}
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Par {post.authorName} • {post.authorRole}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredPosts.length === 0 && (
                <div className="card text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune publication trouvée
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par créer votre première publication'}
                    </p>
                    {!searchTerm && selectedCategory === 'all' && selectedType === 'all' && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Créer une publication
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <PostModal
                    post={editingPost}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default PostsPage;