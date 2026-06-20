import api from "../api";

export const labServices = {
    getDashboard: () => api.get(`/lab/dashboard/`),
    getDetailRequestView: (id) => api.get(`/lab/detail_view/${id}/request/`),
    getDetailReportView: (id) => api.get(`/lab/detail_view/${id}/report/`),
    updateRequestStatus: (id) => api.patch(`/lab/request/status/${id}/update/`),
    updateLabReport: (id) => api.patch(`/lab/report/${id}/update/`),
    uploadLabReport: (id) => api.post(`/lab/report/${id}/upload/`),
    approveResult: (id) => api.post(`/lab/result/${id}/approve/`),
    rejectResult: (id) => api.post(`/lab/result/${id}/reject/`),
    sendToDoctor: (id) => api.post(`/lab/send/to/doctor/${id}/`),
    searchItems: () => api.get(`/lab/search/lab-views/`),
    getLabRequestList: () => api.get(`/lab/request-list/`),
    getLabReportList: () => api.get(`/lab/report-list/`),
    patientLabHistory: (id) => api.get(`/lab/patient/${id}/history/`),
    labProfile: () => api.get(`/lab/profile/`),
    updateProfile: () => api.put(`/lab/profile/update/`),
    uploadPhoto: () => api.post(`/lab/update/profile/upload-photo/`),
    deletePhoto: () => api.delete(`/lab/update/profile/delete-photo/`,),
    stats: () => api.get(`/lab/stats/`),

    testProfileList: () => api.get(`/lab/test-profile/list/`),
    testProfileView: (id) => api.get(`/lab/test-profile/${id}/detail/`),
    resultEntry: (id) => api.get(`/lab/entry-result/${id}/detail/`),
    saveResultEntry: (id) => api.post(`/lab/save-result/${id}/`),
    getStructuredResults: (id) => api.get(`/lab/get/${id}/result/structured/`),
};

export default labServices;