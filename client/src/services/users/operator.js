import api from "../api";

/**
 * @typedef {Object} Transaction
 * @property {number} id
 * @property {number} bill
 * @property {number} amount
 * @property {'Pending'|'Completed'|'Overdue'} payment_status
 * @property {'Cash'|'Credit Card'|'Debit Card'|'M-Pesa'|'Cheque'|'Insurance'} payment_method
 * @property {string} timestamp
 * @property {string} status
 * @property {string} cleared_at
 * @property {string} created_at
 * @property {string} notes
 */

const validateTransaction = (t) => {
    if (typeof t.id !== "number") throw new Error("Invalid id");
    if (!["Pending", "Completed", "Overdue"].includes(t.payment_status))
        throw new Error("Invalid payment_status");
    if (typeof t.amount !== "number") throw new Error("Invalid amount");
    return true;
};

export const OperatorService = {
    getDashboard: () => api.get(`/operator/dashboard/`),

    processPayment: (id) =>
        api.post(`/process/payment/${id}/`),

    printReceipt: (id) =>
        api.get(`/receipt/print/${id}/`),

    viewReceipt: (id) =>
        api.get(`/view/receipt/${id}/`),

    getBills: () =>
        api.get(`/operator/bills/`),

    createBill: (data) =>
        api.post(`/create/bill/`, data),

    recordPayment: (id, data) =>
        api.post(`/bill/record-payment/${id}/`, data),

    generateInvoice: (id) =>
        api.get(`/bill/invoice/${id}/`),

    reportBill: () =>
        api.get(`/bill/export/`),

    billAnalysis: () =>
        api.get(`/bill/analytics/`),

    getBillDetail: (id) =>
        api.get(`/bill/detailView/${id}/`),

    updateBill: (id, data) =>
        api.patch(`/bill/detailView/${id}/`, data),

    deleteBill: (id) =>
        api.delete(`/bill/detailView/${id}/`),

    searchStaff: (query) =>
        api.get(`/staff/search/`, { params: { q: query } }),

    sendReminder: (id) =>
        api.post(`/send/${id}/reminder/`),

    /**
     * @param {Object} filters
     * @returns {Promise<{data: {transactions: Transaction[]}}>}
     */
    getTransactions: async (filters) => {
        const response = await api.get(`/operator/transaction-list/`, {
            params: filters,
        });

        const transactions = response.data?.data?.transactions || [];
        transactions.forEach(validateTransaction);

        return response;
    },
    downloadInvoicePdf: (id)=>
        api.get(`operator/invoice-bill/${id}/download-pdf/`),

    exportTransactions: (params) =>
        api.get(`/operator/transaction-list/export/`, {
            params,
            responseType: 'blob',
        }),
    getStaffProfile: () =>
        api.get(`/operator/get/profile`),
    
    updateStaffProfile: (data) =>
        api.put(`/operator/update/profile`, data),
};
export default OperatorService;