import api from "../api";

export const adminService = {
    getDashboard: () => api.get(`/admin/dashboard/my/`),
    announcements: () => api.post(`/admin/announcements/`),
    getAdminProfile: () => api.get('/admin/profile/'),
    updateAdminProfile: (data) => api.patch('/admin/profile/', data),
    setApproval: (id) => api.post(`/admin/set-approval/user/${id}/`),
    deactivateUser: (id) => api.post(`/admin/deactivate/user/${id}/`),
    heatmap: () => api.get(`/admin/appointments/heatmap/`),
    schedules: () => api.get(`/admin/schedules/`),
    editPatient: (id) => api.put(`/admin/patient/edit/${id}/`),
    deleteUser: (id) => api.delete(`/admin/delete/user/${id}/`),
    chartData: () => api.get(`/admin/chart/view/`),
    getAllDoctors: () => api.get(`/admin/doctor/get/`),
    getAllPatients: () => api.get(`/admin/patient/get/`),
    getAllBillStaff: () => api.get(`/admin/operator/get/`),
    liveData: () => api.get(`/admin/live/data/`),
    searchItems: () => api.get(`/admin/search/`),
    getallUsers: () => api.get('/admin/all/'),
    getUser: (id) => api.get(`/admin/user/${id}/detail-view/`),
    updateUser: (id) => api.patch(`/admin/user/${id}/detail-view/`),
    pendingApprovals: () => api.get(`/admin/approvals/pending/`),
    getSettings: () => api.post(`/admin/system/settings/`),
    updatetSettings: () => api.patch(`/admin/system/settings/`),
    testEmail: () => api.post(`/admin/settings/test-mail/`),
    backupSettings: () => api.post(`/admin/settings/backup/`),
    auditView: () => api.get('/admin/audits/'),
    generateReport: () => api.post('/admin/report/generate/'),
    downloadReport: (id) => api.get(`/admin/report/${id}/download/`),
    deleteReport: (id) => api.delete(`/admin/report/${id}/delete/`),
};

export default adminService;