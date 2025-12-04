import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Filter, TrendingUp, Calendar, CreditCard, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { donationService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import useThemeStore from '../../store/themeStore';

const DonationsPage = () => {
    const { theme } = useThemeStore();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    const types = [
        { value: 'all', label: 'Tous les types' },
        { value: 'oneTime', label: 'Don ponctuel' },
        { value: 'monthly', label: 'Don mensuel' }
    ];

    const paymentMethods = [
        { value: 'all', label: 'Toutes les méthodes' },
        { value: 'creditCard', label: 'Carte de crédit' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'tmoney', label: 'T-Money' },
        { value: 'flooz', label: 'Flooz' }
    ];

    const periods = [
        { value: 'all', label: 'Toute la période' },
        { value: '7days', label: '7 derniers jours' },
        { value: '30days', label: '30 derniers jours' },
        { value: '90days', label: '90 derniers jours' },
        { value: 'year', label: 'Cette année' }
    ];

    useEffect(() => {
        fetchDonations();
    }, [selectedType, selectedPaymentMethod, selectedPeriod]);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 100,
                ...(selectedType !== 'all' && { type: selectedType }),
                ...(selectedPaymentMethod !== 'all' && { paymentMethod: selectedPaymentMethod }),
                ...(selectedPeriod !== 'all' && { period: selectedPeriod })
            };
            const response = await donationService.getAllDonations(params);
            setDonations(response.data.donations);
        } catch (error) {
            toast.error('Erreur lors du chargement des donations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonations = donations.filter(donation =>
        donation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeLabel = (type) => {
        const labels = {
            oneTime: 'Ponctuel',
            monthly: 'Mensuel'
        };
        return labels[type] || type;
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            creditCard: 'Carte',
            paypal: 'PayPal',
            tmoney: 'T-Money',
            flooz: 'Flooz'
        };
        return labels[method] || method;
    };

    const getPaymentMethodIcon = (method) => {
        return <CreditCard className="w-4 h-4" />;
    };

    const totalAmount = filteredDonations.reduce((acc, d) => acc + d.amount, 0);
    const oneTimeTotal = filteredDonations.filter(d => d.type === 'oneTime').reduce((acc, d) => acc + d.amount, 0);
    const monthlyTotal = filteredDonations.filter(d => d.type === 'monthly').reduce((acc, d) => acc + d.amount, 0);
    const averageDonation = filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0;

    const exportToCSV = () => {
        const headers = ['Date', 'Donateur', 'Montant', 'Type', 'Méthode', 'Message'];
        const rows = filteredDonations.map(d => [
            format(new Date(d.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
            d.isAnonymous ? 'Anonyme' : d.userName,
            `${d.amount.toFixed(2)} FCFA`,
            getTypeLabel(d.type),
            getPaymentMethodLabel(d.paymentMethod),
            d.message || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `donations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Donations
                    </h1>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gérez et suivez les dons reçus
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="btn-primary"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Exporter CSV
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
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

                        <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="input"
                        >
                            {paymentMethods.map(method => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="input"
                        >
                            {periods.map(period => (
                                <option key={period.value} value={period.value}>
                                    {period.label}
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
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Total collecté
                            </p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {totalAmount.toLocaleString()} FCFA
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Nombre de dons
                            </p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {filteredDonations.length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Don moyen
                            </p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {averageDonation.toLocaleString()} FCFA
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Mensuels actifs
                            </p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {donations.filter(d => d.type === 'monthly').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Donations Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Donateur</th>
                            <th>Montant</th>
                            <th>Type</th>
                            <th>Méthode</th>
                            <th>Message</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredDonations.map((donation) => (
                            <tr key={donation.id}>
                                <td className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {format(new Date(donation.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                </td>
                                <td>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                            <span className="text-primary-700 font-medium text-sm">
                                                {donation.isAnonymous ? '?' : donation.userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {donation.isAnonymous ? 'Donateur anonyme' : donation.userName}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                        {donation.amount.toLocaleString()} FCFA
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${
                                        donation.type === 'monthly' ? 'badge-primary' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {getTypeLabel(donation.type)}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {getPaymentMethodIcon(donation.paymentMethod)}
                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {getPaymentMethodLabel(donation.paymentMethod)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {donation.message || '-'}
                                    </p>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty state */}
            {filteredDonations.length === 0 && (
                <div className="card text-center py-12">
                    <DollarSign className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Aucune donation trouvée
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {searchTerm || selectedType !== 'all' || selectedPaymentMethod !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Les donations apparaîtront ici une fois reçues'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DonationsPage;