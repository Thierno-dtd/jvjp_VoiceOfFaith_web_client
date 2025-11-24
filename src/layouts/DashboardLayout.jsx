import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import {
    LayoutDashboard,
    Music,
    BookOpen,
    Calendar,
    Image,
    Users,
    Radio,
    User,
    LogOut,
    Menu,
    X,
    ChevronDown
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { theme, toggleTheme } = useThemeStore();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Déconnexion réussie');
            navigate('/login');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'Audios',
            href: '/audios',
            icon: Music,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'Sermons',
            href: '/sermons',
            icon: BookOpen,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'Événements',
            href: '/events',
            icon: Calendar,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'Publications',
            href: '/posts',
            icon: Image,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'LIVE',
            href: '/live',
            icon: Radio,
            roles: ['admin', 'pasteur', 'media']
        },
        {
            name: 'Utilisateurs',
            href: '/users',
            icon: Users,
            roles: ['admin']
        }
    ];

    const filteredNavigation = navigation.filter(item =>
        item.roles.includes(user?.role)
    );

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
            pasteur: { label: 'Pasteur', color: 'bg-blue-100 text-blue-800' },
            media: { label: 'Média', color: 'bg-green-100 text-green-800' }
        };
        return badges[role] || badges.media;
    };

    const roleBadge = getRoleBadge(user?.role);

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex flex-col flex-grow border-r-4 pt-5 pb-4 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-2 mb-8 border-b pb-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <div className="ml-1 mr-5">
                                <h1 className="text-xl font-bold text-gray-900">Voice of Faith</h1>
                                <p className="text-xs text-gray-500">Administration</p>
                            </div>
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-gray-200"
                                title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {filteredNavigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}

                    </nav>

                    {/*<div className="flex-shrink-0 px-3 mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">

                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                                >
                                    {theme === 'light' ? (
                                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    )}
                                </button>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    theme
                                </p>

                            </div>
                        </div>
                </div>*/}

                    {/* User Info */}
                    <div className="flex-shrink-0 px-3 mt-4 border-t border-gray-200 pt-4">
                        <NavLink
                            key='profile'
                            to='/profile'
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary-700" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.displayName}
                                    </p>
                                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
                                </div>
                            </div>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>



            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600/75"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className={`fixed inset-y-0 left-0 flex w-full max-w-xs flex-col animate-slide-in-right ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex items-center justify-between px-4 py-5 border-b">
                            <h2 className="text-xl font-bold">Menu</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {filteredNavigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                                            isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="border-t p-4 ">
                            <NavLink
                                key='profile'
                                to='/profile'
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary-700" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.displayName}
                                        </p>
                                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
                                    </div>
                                </div>
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="w-full btn-secondary"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top Bar - Mobile */}
                <div className={`sticky top-0 z-10 flex h-16 border-b-4 lg:hidden ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={`px-4 focus:outline-none ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex items-center justify-center">
                        <h1 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            Voice of Faith</h1>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </button>
                    <div className="w-16" />
                </div>

                {/* Page Content */}
                <main className="flex-1">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;