import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Search, Download, Trash2, Edit, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { sermonService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SermonModal from '../../components/sermons/SermonModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SermonsPage = () => {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);

    const months = [
        { value: 'all', label: 'Tous les mois' },
        { value: '1', label: 'Janvier' },
        { value: '2', label: 'Février' },
        { value: '3', label: 'Mars' },
        { value: '4', label: 'Avril' },
        { value: '5', label: 'Mai' },
        { value: '6', label: 'Juin' },
        { value: '7', label: 'Juillet' },
        { value: '8', label: 'Août' },
        { value: '9', label: 'Septembre' },
        { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Décembre' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        fetchSermons();
    }, [selectedYear, selectedMonth]);

    const fetchSermons = async () => {
        try {
            setLoading(true);
            const params = {
                year: selectedYear,
                ...(selectedMonth !== 'all' && { month: parseInt(selectedMonth) })
            };
            const response = await sermonService.getAllSermons(params);
            setSermons(response.data.sermons);
        } catch (error) {
            toast.error('Erreur lors du chargement des sermons');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sermon ?')) return;

        try {
            await sermonService.deleteSermon(id);
            setSermons(sermons.filter(s => s.id !== id));
            toast.success('Sermon supprimé avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const handleEdit = (sermon) => {
        setEditingSermon(sermon);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingSermon(null);
        fetchSermons();
    };

    const handleDownload = async (sermon) => {
        try {
            await sermonService.incrementDownloads(sermon.id);
            window.open(sermon.pdfUrl, '_blank');
        } catch (error) {
            console.error('Error incrementing downloads:', error);
            window.open(sermon.pdfUrl, '_blank');
        }
    };

    const filteredSermons = sermons.filter(sermon =>
        sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-gray-900">Sermons</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les sermons et leurs documents PDF
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau sermon
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un sermon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="input"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="input"
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Sermons</p>
                            <p className="text-2xl font-bold text-gray-900">{sermons.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Téléchargements</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {sermons.reduce((acc, s) => acc + (s.downloads || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Download className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Moyenne/Sermon</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {sermons.length > 0
                                    ? Math.round(sermons.reduce((acc, s) => acc + (s.downloads || 0), 0) / sermons.length)
                                    : 0
                                }
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sermons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.map((sermon) => (
                    <div key={sermon.id} className="card-hover group">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            <img
                                src={sermon.imageUrl}
                                alt={sermon.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Actions overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleDownload(sermon)}
                                    className="p-3 bg-white rounded-lg hover:bg-gray-100"
                                >
                                    <Download className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => handleEdit(sermon)}
                                    className="p-3 bg-white rounded-lg hover:bg-gray-100"
                                >
                                    <Edit className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => handleDelete(sermon.id)}
                                    className="p-3 bg-white rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {sermon.title}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(sermon.date), 'dd MMMM yyyy', { locale: fr })}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Download className="w-4 h-4" />
                                    {sermon.downloads || 0}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(sermon)}
                                className="btn-primary w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger le PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredSermons.length === 0 && (
                <div className="card text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun sermon trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedMonth !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par ajouter votre premier sermon'}
                    </p>
                    {!searchTerm && selectedMonth === 'all' && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Ajouter un sermon
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <SermonModal
                    sermon={editingSermon}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default SermonsPage;