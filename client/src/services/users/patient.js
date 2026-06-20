import { api } from '../api';

export const PatientService = {
    getDashboard: () => api.get(`/patient/dashboard/`),
    bookAppointment: () => api.post(`/patient/appointment/book/`),
    getDoctors: () => api.get(`/patient/appointment/book/`),
    getAvailableSlots: () => api.get(`/patient/appointment/book/`),
    getBill: (id) => api.get(`/patient/view/bill/${id}/`),
    downloadInvoice: (id) => api.get(`/patient/bills/${id}/invoice/`),
    paymentHistory: () => api.get(`/patient/bills/payment-history/`),
    getProfile: () => api.get(`/patient/get/profile/`),
    updateProfile: () => api.put(`/patient/update/profile/`),
    downloadReport: (id) => api.get(`/patient/download/report/${id}/`),
    editAppointment: (id) => api.patch(`/patient/edit/appointment/${id}/`),
    viewLab: (id) => api.get(`/patient/lab/result/${id}/`),
    downloadLabReport: (id) => api.get(`/patient/lab/result/${id}/`),
    viewNotification: () => api.get(`/patient/notification/`),
    cancelAppointment: (id) => api.delete(`/patient/appointment/${id}/cancel/`),
    confirmAppointment: (id) => api.post(`/patient/appointment/${id}/confirm/`),
    getAllAppointments: () => api.get(`/patient/appointment/list/`),
    rescheduleAppointments: (id) => api.get(`/patient/appointments/${id}/reschedule/`),
    detailAppointmentView: (id) => api.get(`/patient/${id}/appointment/`),

    getMedicalRecords: () => api.get(`/patient/medical-records/`),
    addMedicalrecords: (data) => api.post(`/patient/medical-records/`, data),
    getVitals: () => api.get(`/patient/vital-views/`),
    addVital: (data) => api.post(`/patient/vital-views/`, data),
    searchAll: async (query = {}, filters = {}) => {
        const response = await api.get('/patient/search', {
            params: { q: query, ...filters }
        }); return response.data
    },
    searchAppointments: async (params = {}) => {
        const response = await api.get('/patient/search/appointment/', { params });
        return response.data;
    },
    searchBills: async (params = {}) => {
        const response = await api.get('/patient/search/bill/', { params });
        return response.data;
    },
    searchDoctors: async (params = {}) => {
        const response = await api.get('/patient/search/doctor/', { params });
        return response.data;
    },
    searchLabResults: async (params = {}) => {
        const response = await api.get('/patient/search/lab-result/', { params });
        return response.data;
    }, searchPrescriptions: async (params = {}) => {
        const response = await api.get('/patient/search/prescription/', { params });
        return response.data;
    },
    getSearchSuggestions: async (query = {}) => {
        const response = await api.get('/patient/search/suggestion/', {
            params: { q: query }
        });
        return response.data;
    },
};

export default PatientService;