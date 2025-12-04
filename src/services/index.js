import api from '../config/api';

// ==================== USERS ====================
export const userService = {
    inviteUser: (data) => api.post('/admin/users/invite', data),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    resendInvitation: (id) => api.post(`/admin/users/${id}/resend`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// ==================== AUDIOS ====================
export const audioService = {
    createAudio: (formData) => api.post('/audios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllAudios: (params) => api.get('/audios', { params }),
    getAudioById: (id) => api.get(`/audios/${id}`),
    updateAudio: (id, data) => api.put(`/audios/${id}`, data),
    deleteAudio: (id) => api.delete(`/audios/${id}`),
    incrementPlays: (id) => api.post(`/audios/${id}/play`),
    incrementDownloads: (id) => api.post(`/audios/${id}/download`)
};

// ==================== SERMONS ====================
export const sermonService = {
    createSermon: (formData) => api.post('/sermons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllSermons: (params) => api.get('/sermons', { params }),
    getSermonById: (id) => api.get(`/sermons/${id}`),
    updateSermon: (id, data) => api.put(`/sermons/${id}`, data),
    deleteSermon: (id) => api.delete(`/sermons/${id}`),
    incrementDownloads: (id) => api.post(`/sermons/${id}/download`),
    getStats: (params) => api.get('/sermons/stats', { params })
};

// ==================== EVENTS ====================
export const eventService = {
    createEvent: (formData) => api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllEvents: (params) => api.get('/events', { params }),
    getEventById: (id) => api.get(`/events/${id}`),
    updateEvent: (id, formData) => api.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteEvent: (id) => api.delete(`/events/${id}`)
};

// ==================== POSTS ====================
export const postService = {
    createPost: (formData) => api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllPosts: (params) => api.get('/posts', { params }),
    getPostById: (id) => api.get(`/posts/${id}`),
    updatePost: (id, data) => api.put(`/posts/${id}`, data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    likePost: (id) => api.post(`/posts/${id}/like`)
};

// ==================== STATS ====================
export const statsService = {
    getOverview: () => api.get('/admin/stats/overview'),
    getAudioStats: (params) => api.get('/admin/stats/audios', { params }),
    getUserStats: () => api.get('/admin/stats/users'),
    getEngagementStats: () => api.get('/admin/stats/engagement')
};

// ==================== LIVE ====================
export const liveService = {
    getStatus: () => api.get('/admin/live/status'),
    updateStatus: (data) => api.put('/admin/live/status', data),
    sendNotification: (data) => api.post('/admin/live/notify', data)
};

// ==================== DONATIONS ==================== ✅ NOUVEAU
export const donationService = {
    getAllDonations: (params) => api.get('/admin/donations', { params }),
    getDonationById: (id) => api.get(`/admin/donations/${id}`),
    getDonationStats: (params) => api.get('/admin/donations/stats', { params }),
    exportDonations: (params) => api.get('/admin/donations/export', {
        params,
        responseType: 'blob'
    })
};

export default {
    user: userService,
    audio: audioService,
    sermon: sermonService,
    event: eventService,
    post: postService,
    stats: statsService,
    live: liveService,
    donation: donationService
};