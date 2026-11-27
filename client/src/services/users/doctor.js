import api from "../api";

const withData = (response, data) => ({ ...response, data });

export const doctorSevice = {
    getDashboard: () => api.get('doctors/dashboard/'),
    patientPdf: (id) => api.get(`doctors/patient/pdf/${id}/`, { responseType: 'blob' }),
    doctorView: () => api.get('doctors/get/profile/'),
    appointmentView: (id) => api.get(`doctors/appointment/${id}/view/`),
    updateAppointment: (id, data) => api.put(`doctors/appointment/${id}/view/`, data),
    myPatients: () => api.get('doctors/my/patients/'),
    statistics: (period = 'month') => api.get('doctors/statistics/', { params: { period } }),
    patientDetail: (id) => api.get(`doctors/patient/detail/${id}/`),
    report: () => api.get('doctors/reports/'),
    sendToPatient: (id, data) => api.post(`doctors/send/to/patient/${id}/`, data),
    getlabResult: async (id) => {
        const response = await api.get('doctors/lab/requests/', {
            params: id ? { patient: id } : {},
        });
        return withData(response, response.data?.data?.lab_requests || []);
    },
    createLabRequest: (data) => api.post('doctors/lab/requests/', data),
    updateProfile: (data) => api.put('doctors/update/profile/', data),
    uploadPhoto: (formData) => api.post('doctors/update/profile/upload-photo/', formData),
    deletePhoto: () => api.delete('doctors/update/profile/delete-photo/'),
    getDoctorProfile: () => api.get('doctors/get/profile/'),
    getDoctorProfilePhoto: (cacheKey) => api.get('doctors/get/profile/photo/', {
        responseType: 'blob',
        params: { _: cacheKey },
    }),
    prescriptions: () => api.get('doctors/prescriptions/'),
    searchItems: (query) => api.get('doctors/search/', { params: { q: query } }),
    getAllAppointments: async () => {
        const response = await api.get('appointment/list/');
        return withData(response, response.data?.data?.appointments || []);
    },
    rescheduleAppointments: (id, data) => api.put(`appointments/${id}/reschedule/`, data),
    getPatientMedicalRecords: (id) => api.get(`doctors/get/${id}/medical-records/`),
    addPatientMedicalrecords: (id, data) => api.post(`doctors/create/${id}/medical-records/`, data),
    getPatientVitals: (id) => api.get(`doctors/get/${id}/vital-views/`),
    addPatientVital: (id, data) => api.post(`doctors/create/${id}/vital-views/`, data),
};

export default doctorSevice;
