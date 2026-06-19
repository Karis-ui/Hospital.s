import { api } from '../api';

export const PatientService = {
    getDashboard: () => api.get(`/dashboard/`),
    bookAppointment: () => api.post(`/appointment/book/`),
    getDoctors: () => api.get(`/appointment/book/`),
    getAvailableSlots: () => api.get(`/appointment/book/`),
    getBill: (id) => api.get(`/view/bill/${id}/`),
    downloadInvoice: (id) => api.get(`/bills/${id}/invoice/`),
    paymentHistory: () => api.get(`/bills/payment-history/`),
    getProfile: () => api.get(`get/profile/`),
    updateProfile: () => api.put(`/update/profile/`),
    downloadReport: (id) => api.get(`/download/report/${id}/`),
    editAppointment: (id) => api.patch(`/edit/appointment/${id}/`),
    viewLab: (id) => api.get(`/lab/result/${id}/`),
    downloadLabReport: (id) => api.get(`/lab/result/${id}/`),
    viewNotification: () => api.get(`/notification/`),
    cancelAppointment: (id) => api.delete(`/appointment/${id}/cancel/`),
    confirmAppointment: (id) => api.post(`/appointment/${id}/confirm/`),
    getAllAppointments: () => api.get(`/appointment/list/`),
    rescheduleAppointments: (id) => api.get(`/appointments/${id}/reschedule/`),
    detailAppointmentView: (id) => api.get(`/${id}/appointment/`),

    getMedicalRecords: () => api.get(`/medical-records/`),
    addMedicalrecords: (data) => api.post(`/medical-records/`, data),
    getVitals: () => api.get(`/vital-views/`),
    addVital: (data) => api.post(`vital-views/`, data),
    detailAppointmentView: (id) => api.get(`/${id}/appointment/`),
    searchAll: async (query = {}, filters = {}) => {
        const response = await api.get('/search', {
            params: { q: query, ...filters }
        }); return response.data
    },
    searchAppointments: async (params = {}) => {
        const response = await api.get('/search/appointment/', { params });
        return response.data;
    },
    searchBills: async (params = {}) => {
        const response = await api.get('/search/bill/', { params });
        return response.data;
    },
    searchDoctors: async (params = {}) => {
        const response = await api.get('/search/doctor/', { params });
        return response.data;
    },
    searchLabResults: async (params = {}) => {
        const response = await api.get('/search/lab-result/', { params });
        return response.data;
    }, searchPrescriptions: async (params = {}) => {
        const response = await api.get('/search/prescription/', { params });
        return response.data;
    },
    getSearchSuggestions: async (query = {}) => {
        const response = await api.get('/search/suggestion/', {
            params: { q: query }
        });
        return response.data;
    },
};

export default PatientService;