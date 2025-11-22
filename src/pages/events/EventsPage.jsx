import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventModal from '../../components/events/EventModal';
import { format, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, upcoming, past
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 50,
                page: 1
            };
            const response = await eventService.getAllEvents(params);
            setEvents(response.data.events);
        } catch (error) {
            toast.error('Erreur lors du chargement des événements');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            await eventService.deleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
            toast.success('Événement supprimé avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        fetchEvents();
    };

    const getFilteredEvents = () => {
        let filtered = events.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const now = new Date();

        if (filterType === 'upcoming') {
            filtered = filtered.filter(event => isAfter(new Date(event.startDate), now));
        } else if (filterType === 'past') {
            filtered = filtered.filter(event => isBefore(new Date(event.endDate), now));
        }

        return filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    };

    const filteredEvents = getFilteredEvents();

    const upcomingCount = events.filter(e => isAfter(new Date(e.startDate), new Date())).length;
    const pastCount = events.filter(e => isBefore(new Date(e.endDate), new Date())).length;

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
                    <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les événements de l'église
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvel événement
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un événement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterType === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setFilterType('upcoming')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterType === 'upcoming'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            À venir
                        </button>
                        <button
                            onClick={() => setFilterType('past')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterType === 'past'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Passés
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">À venir</p>
                            <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Passés</p>
                            <p className="text-2xl font-bold text-gray-900">{pastCount}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                    const isPast = isBefore(new Date(event.endDate), new Date());
                    const isUpcoming = isAfter(new Date(event.startDate), new Date());

                    return (
                        <div key={event.id} className="card-hover group relative">
                            {/* Status badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`badge ${
                                    isUpcoming ? 'badge-success' : isPast ? 'bg-gray-100 text-gray-800' : 'badge-primary'
                                }`}>
                                    {isUpcoming ? 'À venir' : isPast ? 'Terminé' : 'En cours'}
                                </span>
                            </div>

                            {/* Image */}
                            <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-4 overflow-hidden">
                                {event.imageUrl ? (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Calendar className="w-12 h-12 text-white opacity-50" />
                                    </div>
                                )}

                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="p-3 bg-white rounded-lg hover:bg-gray-100"
                                    >
                                        <Edit className="w-5 h-5 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-3 bg-white rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {event.description || 'Pas de description'}
                                </p>

                                {/* Meta */}
                                <div className="space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}
                                            {event.endDate && new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                                                <> - {format(new Date(event.endDate), 'dd MMM yyyy', { locale: fr })}</>
                                            )}
                                        </span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Daily summaries count */}
                                {event.dailySummaries && event.dailySummaries.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            {event.dailySummaries.length} résumé(s) quotidien(s)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredEvents.length === 0 && (
                <div className="card text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun événement trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterType !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par créer votre premier événement'}
                    </p>
                    {!searchTerm && filterType === 'all' && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Créer un événement
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <EventModal
                    event={editingEvent}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default EventsPage;