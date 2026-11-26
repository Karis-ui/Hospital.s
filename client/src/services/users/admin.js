import api from "../api";

export const adminService = {
    getDashboard: () => api.get(`admin/dashboard/my/`),
    announcements: () => api.get(`admin/announcements/`),
    getAdminProfile: () => api.get(`admin/profile/`),
    getAdminPhoto: (cacheKey) => api.get(`admin/profile/photo/`, {
        responseType: 'blob',
        params: { _: cacheKey },
    }),
    updateAdminProfile: (data) => api.patch(`admin/profile/`, data),
    uploadAdminPhoto: (formData) => api.post(`admin/profile/`, formData),
    setApproval: (id) => api.post(`admin/set-approval/user/${id}/`),
    deactivateUser: (id) => api.post(`admin/deactivate/user/${id}/`),
    heatmap: () => api.get(`admin/appointments/heatmap/`),
    schedules: () => api.get(`admin/schedules/`),
    editPatient: (id) => api.put(`admin/patient/edit/${id}/`),
    deleteUser: (id) => api.delete(`admin/delete/user/${id}/`),
    chartData: () => api.get(`admin/chart/view/`),
    getAllDoctors: () => api.get(`admin/doctor/get/`),
    getAllPatients: () => api.get(`admin/patient/get/`),
    getAllBillStaff: () => api.get(`admin/operator/get/`),
    liveData: () => api.get(`admin/live/data/`),
    searchItems: () => api.get(`admin/search/`),
    getallUsers: () => api.get(`admin/all/`),
    getUser: (id) => api.get(`admin/user/${id}/detail-view/`),
    updateUser: (id) => api.patch(`admin/user/${id}/detail-view/`),
    pendingApprovals: () => api.get(`admin/approvals/pending/`),
    getSettings: () => api.get(`admin/system/settings/`),
    updatetSettings: (data) => api.patch(`admin/system/settings/`, data),
    testEmail: () => api.post(`admin/settings/test-mail/`),
    backupSettings: () => api.post(`admin/settings/backup/`),
    auditView: (params) => api.get(`admin/audits/`, { params }),
    generateReport: () => api.post(`admin/report/generate/`),
    downloadReport: (id) => api.get(`admin/report/${id}/download/`),
    deleteReport: (id) => api.delete(`admin/report/${id}/delete/`),
};

export default adminService;