import api from "../api";

export const doctorSevice = {
    getDashboard: () => api.get(`/doctor/dashboard/`),
    patientPdf: (id) => api.get(`/doctor/patient/pdf/${id}/`),
    doctorView: () => api.get('/doctor/view/'),
    appointmentView: (id) => api.get(`/doctor/appointment/${id}/view/`),
    updateAppointment: (id) => api.put(`/doctor/appointment/${id}/view/`),
    myPatients: () => api.get(`/doctor/my/patients/`),
    statistics: () => api.get(`/doctor/statistics/`),
    patientDetail: (id) => api.get(`/doctor/patient/detail/${id}/`),
    report: () => api.get(`/doctor/reports/`),
    sendToPatient: (id) => api.post(`/doctor/send/to/patient/${id}/`),
    getlabResult: (id) => api.get(`/doctor/lab/requests/${id}/`),
    createLabRequest: () => api.post(`/doctor/lab/requests/`,),
    updateProfile: () => api.put(`/doctor/update/profile/`),
    uploadPhoto: () => api.post(`/doctor/update/profile/upload-photo/`),
    deletePhoto: () => api.delete(`/doctor/update/profile/delete-photo/`),
    getDoctorProfile: () => api.get(`/doctor/get/profile/`),
    prescriptions: () => api.get(`/doctor/prescriptions/`),
    searchItems: () => api.get(`/doctor/search/`),
    getAllAppointments: () => api.get(`/doctor/appointment/list/`),
    rescheduleAppointments: (id) => api.get(`/doctor/appointments/${id}/reschedule/`),

    getPatientMedicalRecords: (id) => api.get(`/doctor/get/${id}/medical-records/`),
    addPatientMedicalrecords: (id, data) => api.post(`/doctor/create/${id}/medical-records/`, data),
    getPatientVitals: (id) => api.get(`/doctor/get/${id}/vital-views/`),
    addPatientVital: (id, data) => api.post(`/doctor/create/${id}/vital-views/`, data),
};

export default doctorSevice;