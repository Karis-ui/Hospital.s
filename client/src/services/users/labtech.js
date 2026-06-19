import api from "../api";

export const labServices = {
    getDashboard: () => api.get(`/dashboard/`),
    getDetailRequestView: (id) => api.get(`/detail_view/${id}/request/`),
    getDetailReportView: (id) => api.get(`/detail_view/${id}/report/`),
    updateRequestStatus: (id) => api.patch(`/request/status/${id}/update/`),
    updateLabReport: (id) => api.patch(`/report/${id}/update/`),
    uploadLabReport: (id) => api.post(`/report/${id}/upload/`),
    approveResult: (id) => api.post(`/result/${id}/approve/`),
    rejectResult: (id) => api.post(`/result/${id}/reject/`),
    sendToDoctor: (id) => api.post(`/send/to/doctor/${id}/`),
    searchItems: () => api.get(`/search/lab-views/`),
    getLabRequestList: () => api.get(`/request-list/`),
    getLabReportList: () => api.get(`/report-list/`),
    patientLabHistory: (id) => api.get(`/patient/${id}/history/`),
    labProfile: () => api.get(`/profile/`),
    updateProfile: () => api.put(`/profile/update/`),
    uploadPhoto: () => api.post(`/update/profile/upload-photo/`),
    deletePhoto: () => api.delete(`update/profile/delete-photo/`,),
    stats: () => api.get(`/stats/`),

    testProfileList: () => api.get(`/test-profile/list/`),
    testProfileView: (id) => api.get(`/test-profile/${id}/detail/`),
    resultEntry: (id) => api.get(`/entry-result/${id}/detail/`),
    saveResultEntry: (id) => api.post(`/save-result/${id}/`),
    getStructuredResults: (id) => api.get(`/get/${id}/result/structured/`),
};

export default labServices;