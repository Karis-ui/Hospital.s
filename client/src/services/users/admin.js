import api from "../api";

export const adminService = {
    getDashboard: () => api.get(`/dashboard/my/`),
    announcements: () => api.post(`/announcements/`),
    getAdminProfile: () => api.get('/api/profile/'),
    updateAdminProfile: (data) => api.patch('/api/profile/', data),
    setApproval: (id) => api.post(`/set-approval/user/${id}/`),
    deactivateUser: (id) => api.post(`/deactivate/user/${id}/`),
    heatmap: () => api.get(`/appointments/heatmap/`),
    schedules: () => api.get(`/schedules/`),
    editPatient: (id) => api.put(`/patient/edit/${id}/`),
    deleteUser: (id) => api.delete(`/delete/user/${id}/`),
    chartData: () => api.get(`/chart/view/`),
    getAllDoctors: () => api.get(`/doctor/get/`),
    getAllPatients: () => api.get(`/patient/get/`),
    getAllBillStaff: () => api.get(`/operator/get/`),
    liveData: () => api.get(`/live/data/`),
    searchItems: () => api.get(`/search/`),
    getallUsers: () => api.get('/all/'),
    getUser: (id) => api.get(`/user/${id}/detail-view/`),
    updateUser: (id) => api.patch(`/user/${id}/detail-view/`),
    pendingApprovals: () => api.get(`/approvals/pending/`),
    getSettings: () => api.post(`/system/settings/`),
    updatetSettings: () => api.patch(`/system/settings/`),
    testEmail: () => api.post(`/settings/test-mail/`),
    backupSettings: () => api.post(`/settings/backup/`),
    auditView: () => api.get('/audits/'),
    generateReport: () => api.post('/report/generate/'),
    downloadReport: (id) => api.get(`/report/${id}/download/`),
    deleteReport: (id) => api.delete(`/report/${id}/delete/`),
};

export default adminService;