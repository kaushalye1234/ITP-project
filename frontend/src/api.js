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

// Auth
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => API.post('/auth/reset-password', { token, newPassword }),
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
};

// Reviews & Complaints (Member 4)
export const reviewAPI = {
    submit: (data) => API.post('/reviews', data),
    getForWorker: (workerUserId) => API.get(`/reviews/worker/${workerUserId}`),
    getAll: () => API.get('/reviews'),
    update: (id, data) => API.put(`/reviews/${id}`, data),
    delete: (id) => API.delete(`/reviews/${id}`),
};

export const complaintAPI = {
    submit: (data) => API.post('/complaints', data),
    getAll: () => API.get('/complaints'),
    updateStatus: (id, status) => API.patch(`/complaints/${id}/status`, { status }),
    delete: (id) => API.delete(`/complaints/${id}`),
};

export const messageAPI = {
    createThread: (data) => API.post('/messages/threads', data),
    sendMessage: (data) => API.post('/messages', data),
    getMessages: (threadId) => API.get(`/messages/threads/${threadId}`),
    getMyThreads: () => API.get('/messages/threads'),
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
};

export default API;
