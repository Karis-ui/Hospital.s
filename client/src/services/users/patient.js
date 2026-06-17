import api from "../api";

export const PatientService = {
    getDashboard: () => api.get(`/patient/dashboard/`),
    bookAppointment: () => api.post(`/patient/appointment/book/`),
    getDoctors: () => api.get(`/patient/appointment/book/`),
    getAvailableSlots: () => api.get(`/patient/appointment/book/`),
    getBill: (id) => api.get(`/view/bill/${id}/`),
    downloadInvoice: (id) => api.get(`/patient/bills/${id}/invoice/`),
    paymentHistory: () => api.get(`/patient/bills/payment-history/`),
    getProfile: () => api.get(`patient/update/profile/`),
    updateProfile: () => api.put(`/update/profile/`),
    downloadReport: (id) => api.get(`/download/report/${id}/`),
    editAppointment: (id) => api.patch(`/edit/appointment/${id}/`),
    viewLab: (id) => api.get(`/lab/result/${id}/`),
    downloadLabReport: (id) => api.get(`/lab/result/${id}/`),
    viewNotification: () => api.get(`/patient/notification/`),
    cancelAppointment: (id) => api.delete(`/appointment/${id}/cancel/`),
    confirmAppointment: (id) => api.post(`/appointment/${id}/confirm/`),
    getAllAppointments: () => api.get(`/appointment/list/`),
    rescheduleAppointments: (id) => api.get(`/appointments/${id}/reschedule/`),
    detailAppointmentView: (id) => api.get(`/patient/${id}/appointment/`),

    getMedicalRecords: () => api.get(`/patient/medical-records/`),
    addMedicalrecords: (data) => api.post(`/patient/medical-records/`, data),
    getVitals: () => api.get(`/patient/vital-views/`),
    addVital: (data) => api.post(`patient/vital-views/`, data),
    detailAppointmentView: (id) => api.get(`/patient/${id}/appointment/`),
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