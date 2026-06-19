import api from "../api";

export const doctorSevice = {
    getDashboard: () => api.get(`/dashboard/`),
    patientPdf: (id) => api.get(`/patient/pdf/${id}/`),
    doctorView: () => api.get('/view/'),
    appointmentView: (id) => api.get(`/appointment/${id}/view/`),
    updateAppointment: (id) => api.put(`/appointment/${id}/view/`),
    myPatients: () => api.get(`/my/patients/`),
    statistics: () => api.get(`/statistics/`),
    patientDetail: (id) => api.get(`/patient/detail/${id}/`),
    report: () => api.get(`/reports/`),
    sendToPatient: (id) => api.post(`/send/to/patient/${id}/`),
    getlabRequest: (id) => api.get(`/lab/requests/${id}/`),
    createLabRequest: () => api.post(`/lab/requests/`,),
    updateProfile: () => api.put(`/update/profile/`),
    uploadPhoto: () => api.post(`/update/profile/upload-photo/`),
    deletePhoto: () => api.delete(`/update/profile/delete-photo/`),
    getDoctorProfile: () => api.get(`/get/profile/`),
    prescriptions: () => api.get(`/prescriptions/`),
    searchItems: () => api.get(`/search/`),
    getAllAppointments: () => api.get(`/appointment/list/`),
    rescheduleAppointments: (id) => api.get(`/appointments/${id}/reschedule/`),

    getPatientMedicalRecords: (id) => api.get(`/get/${id}/medical-records/`),
    addPatientMedicalrecords: (id, data) => api.post(`/create/${id}/medical-records/`, data),
    getPatientVitals: (id) => api.get(`/get/${id}/vital-views/`),
    addPatientVital: (id, data) => api.post(`/create/${id}/vital-views/`, data),
};

export default doctorSevice;