import api from "../api";

export const labServices = {
    getDashboard: () => api.get(`/dashboard/`),
    getDetailRequestView: (id) => api.get(`/labTechnician/detail_view/${id}/request/`),
    getDetailReportView: (id) => api.get(`/labTechnician/detail_view/${id}/report/`),
    updateRequestStatus: (id) => api.patch(`/request/status/${id}/update/`),
    updateLabReport: (id) => api.patch(`/report/${id}/update/`),
    uploadLabReport: (id) => api.post(`/labTechnician/report/${id}/upload/`),
    approveResult: (id) => api.post(`/result/${id}/approve/`),
    rejectResult: (id) => api.post(`/result/${id}/reject/`),
    sendToDoctor: (id) => api.post(`/send/to/doctor/${id}/`),
    searchItems: () => api.get(`/search/lab-views/`),
    getLabRequestList: () => api.get(`/lab/request-list/`),
    getLabReportList: () => api.get(`/lab/report-list/`),
    patientLabHistory: (id) => api.get(`/lab/patient/${id}/history/`),
    labProfile: () => api.get(`/lab/profile/`),
    updateProfile: () => api.put(`/lab/profile/update/`),
    uploadPhoto: () => api.post(`/update/profile-lab/upload-photo/`),
    deletePhoto: () => api.delete(`update/profile-lab/delete-photo/`,),
    stats: () => api.get(`/lab/stats/`),

    testProfileList: () => api.get(`/lab/test-profile/list/`),
    testProfileView: (id) => api.get(`/lab/test-profile/${id}/detail/`),
    resultEntry: (id) => api.get(`/lab/entry-result/${id}/detail/`),
    saveResultEntry: (id) => api.post(`/lab/save-result/${id}/`),
    getStructuredResults: (id) => api.get(`/lab/get/${id}/result/structured/`),
};

export default labServices;