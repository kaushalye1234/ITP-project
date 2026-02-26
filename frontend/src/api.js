import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8083/api',
});

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired / invalid JWT — clear session and redirect to login
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    googleLogin: (idToken) => API.post('/auth/google', { idToken }),
    forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => API.post('/auth/reset-password', { token, newPassword }),
    me: () => API.get('/auth/me'),
};

// Profile (any role)
export const profileAPI = {
    getMe: () => API.get('/profile/me'),
    updateMe: (data) => API.put('/profile/me', data),
};

// Workers (Member 1 - User Management)
export const workerAPI = {
    getAll: (district) => API.get('/workers', { params: { district } }),
    getById: (id) => API.get(`/workers/${id}`),
    getMe: () => API.get('/workers/me'),
    updateMe: (data) => API.put('/workers/me', data),
    deleteMe: () => API.delete('/workers/me'),
    getAllUsers: () => API.get('/workers/admin/users'),
    toggleUser: (userId) => API.patch(`/workers/admin/users/${userId}/toggle`),
    changeRole: (userId, role) => API.patch(`/workers/admin/users/${userId}/role`, { role }),
};

// Jobs (Member 2 - Job Posting)
export const jobAPI = {
    getAll: (params) => API.get('/jobs', { params }),
    getById: (id) => API.get(`/jobs/${id}`),
    getMine: () => API.get('/jobs/my'),
    create: (data) => API.post('/jobs', data),
    update: (id, data) => API.put(`/jobs/${id}`, data),
    delete: (id) => API.delete(`/jobs/${id}`),
    getCategories: () => API.get('/jobs/categories'),
    apply: (jobId, data) => API.post(`/jobs/${jobId}/apply`, data),
    getApplications: (jobId) => API.get(`/jobs/${jobId}/applications`),
    updateApplication: (jobId, appId, data) => API.patch(`/jobs/${jobId}/applications/${appId}`, data),
    getApplied: () => API.get('/jobs/applied'),
    updateStatus: (jobId, status) => API.patch(`/jobs/${jobId}/status`, { status }),
};

// Bookings (Member 3 - Booking Management)
export const bookingAPI = {
    create: (data) => API.post('/bookings', data),
    getAll: () => API.get('/bookings'),
    getMine: (as) => API.get('/bookings/my', { params: { as } }),
    getById: (id) => API.get(`/bookings/${id}`),
    update: (id, data) => API.put(`/bookings/${id}`, data),
    delete: (id) => API.delete(`/bookings/${id}`),
    updateStatus: (id, status, reason) => API.patch(`/bookings/${id}/status`, { status, reason }),
    getHistory: (id) => API.get(`/bookings/${id}/history`),
    getBusyDates: (workerId) => API.get(`/bookings/worker/${workerId}/busy-dates`),
};

// Reviews & Complaints (Member 4)
export const reviewAPI = {
    submit: (data) => API.post('/reviews', data),
    getForWorker: (workerUserId) => API.get(`/reviews/worker/${workerUserId}`),
    getAll: () => API.get('/reviews'),
    getMine: () => API.get('/reviews/my'),
    update: (id, data) => API.put(`/reviews/${id}`, data),
    delete: (id) => API.delete(`/reviews/${id}`),
};

export const complaintAPI = {
    submit: (data) => API.post('/complaints', data),
    getAll: () => API.get('/complaints'),
    getMine: () => API.get('/complaints/my'),
    updateStatus: (id, status) => API.patch(`/complaints/${id}/status`, { status }),
    delete: (id) => API.delete(`/complaints/${id}`),
};

export const messageAPI = {
    createThread: (data) => API.post('/messages/threads', data),
    sendMessage: (data) => API.post('/messages', data),
    getMessages: (threadId) => API.get(`/messages/threads/${threadId}`),
    getMyThreads: () => API.get('/messages/threads'),
    getUnreadCount: () => API.get('/messages/unread-count'),
};

// Equipment (Member 5)
export const equipmentAPI = {
    getAvailable: () => API.get('/equipment'),
    getAll: () => API.get('/equipment/all'),
    getById: (id) => API.get(`/equipment/${id}`),
    add: (data) => API.post('/equipment', data),
    update: (id, data) => API.put(`/equipment/${id}`, data),
    delete: (id) => API.delete(`/equipment/${id}`),
    book: (data) => API.post('/equipment/book', data),
    returnEquipment: (bookingId) => API.post(`/equipment/bookings/${bookingId}/return`),
    calculateLateFee: (bookingId) => API.get(`/equipment/bookings/${bookingId}/late-fee`),
    getMyBookings: () => API.get('/equipment/my-bookings'),
    getCategories: () => API.get('/equipment/categories'),
    getSupplierMine: () => API.get('/equipment/supplier/mine'),
};

// Notifications
export const notificationAPI = {
    getAll: () => API.get('/notifications'),
    markRead: (id) => API.patch(`/notifications/${id}/read`),
    markAllRead: () => API.patch('/notifications/read-all'),
};

export default API;
