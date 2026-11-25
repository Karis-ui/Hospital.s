import { api } from '../api';

export const PatientService = {
    getDashboard: () => api.get(`patient/dashboard/`),
    bookAppointment: (data) => api.post(`patient/appointment/book/`, data),
    getDoctors: (params = {}) => api.get(`patient/available-doctors/`, { params }),
    getBills: () => api.get(`patient/bills/`),
    getBill: (id) => api.get(`patient/view/bill/${id}/`),
    downloadInvoice: (id) => api.get(`patient/bills/${id}/invoice/`, { responseType: 'blob' }),
    paymentHistory: () => api.get(`patient/bills/payment-history/`),
    getProfile: () => api.get(`patient/get/profile/`),
    updateProfile: (formData) => api.put(`patient/update/profile/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    }),
    uploadProfilePhoto: (formData) => api.post(`patient/update/profile/upload-photo/`, formData),
    downloadReport: (id) => api.get(`patient/download/report/${id}/`),
    editAppointment: (id) => api.patch(`patient/edit/appointment/${id}/`),
    getLabResults: () => api.get(`patient/lab/results/`),
    viewLab: (id) => api.get(`patient/lab/result/${id}/`),
    downloadLabReport: (id) => api.get(`patient/lab/result/${id}/download/`, { responseType: 'blob' }),
    viewNotification: () => api.get(`patient/notification/`),
    cancelAppointment: (id) => api.delete(`patient/appointment/${id}/cancel/`),
    confirmAppointment: (id) => api.post(`patient/appointment/${id}/confirm/`),
    getAllAppointments: () => api.get(`appointment/list/`),
    rescheduleAppointments: (id) => api.get(`patient/appointments/${id}/reschedule/`),
    detailAppointmentView: (id) => api.get(`patient/${id}/appointment/`),

    getMedicalRecords: () => api.get(`patient/medical-records/`),
    addMedicalrecords: (data) => api.post(`patient/medical-records/`, data),
    getVitals: () => api.get(`patient/vital-views/`),
    addVital: (data) => api.post(`patient/vital-views/`, data),
    searchAll: async (query = {}, filters = {}) => {
        const response = await api.get(`patient/search`, {
            params: { q: query, ...filters }
        }); return response.data
    },
    searchAppointments: async (params = {}) => {
        const response = await api.get(`patient/search/appointment/`, { params });
        return response.data;
    },
    searchBills: async (params = {}) => {
        const response = await api.get(`patient/search/bill/`, { params });
        return response.data;
    },
    searchDoctors: async (params = {}) => {
        const response = await api.get(`patient/search/doctor/`, { params });
        return response.data;
    },
    searchLabResults: async (params = {}) => {
        const response = await api.get(`patient/search/lab-result/`, { params });
        return response.data;
    }, searchPrescriptions: async (params = {}) => {
        const response = await api.get(`patient/search/prescription/`, { params });
        return response.data;
    },
    getSearchSuggestions: async (query = {}) => {
        const response = await api.get(`patient/search/suggestion/`, {
            params: { q: query }
        });
        return response.data;
    },
};

export default PatientService;