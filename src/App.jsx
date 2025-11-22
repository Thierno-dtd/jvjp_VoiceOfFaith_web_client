import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { LoadingPage } from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import AudiosPage from './pages/audios/AudiosPage';
import SermonsPage from './pages/sermons/SermonsPage';
import EventsPage from './pages/events/EventsPage';
import PostsPage from './pages/posts/PostsPage';
import UsersPage from './pages/users/UsersPage';
import LivePage from './pages/live/LivePage';
import ProfilePage from './pages/users/ProfilePage';
import NotFoundPage from './pages/notfound/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuthStore();

    if (loading) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (requiredRole) {
        const roleHierarchy = {
            admin: 3,
            pasteur: 2,
            media: 1
        };

        const userLevel = roleHierarchy[user?.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return <LoadingPage />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="audios" element={<AudiosPage />} />
                        <Route path="sermons" element={<SermonsPage />} />
                        <Route path="events" element={<EventsPage />} />
                        <Route path="posts" element={<PostsPage />} />
                        <Route path="live" element={<LivePage />} />
                        <Route path="profile" element={<ProfilePage />} />

                        {/* Admin only routes */}
                        <Route
                            path="users"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <UsersPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;