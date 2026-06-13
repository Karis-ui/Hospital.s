import api from "../api";

export const coreService = {
    getHome: () => api.get(`/home/`),
    patientList: () => api.get(`/patient/list/`),
    secureDownload: (id) => api.get(`/secure/download/${id}/`),
    notifications: () => api.get(`/notification/`),
    markNotification: (id) => api.patch(`/mark/notification/${id}/`),
    deleteNotification: (id) => api.delete(`/mark/notification/${id}/`),
    markNotifications: () => api.patch(`/mark/notifications/`),
    deleteNotifications: () => api.delete(`/mark/notifications/`),
    announcements: () => api.get(`/announcement/`),
    bookAppointment: () => api.post(`/random/book/appointment/`),
    emergency: () => api.get(`/emergency/`),
    appointmentList: () => api.get(`/appointment/list/`),
    rescheduleAppointment: () => api.put(`/reschedule/appointment/`),
};

export default coreService;