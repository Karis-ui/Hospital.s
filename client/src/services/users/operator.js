import api from "../api";

/**
 * @typedef {Object} Transaction
 * @property {number} id
 * @property {number} bill
 * @property {number} amount
 * @property {'Pending'|'Cleared'|'Overdue'} payment_status
 * @property {'Cash'|'Credit Card'|'Debit Card'|'M-Pesa'|'Cheque'|'Insurance'} payment_method
 * @property {string} timestamp
 * @property {string} status
 * @property {string} cleared_at
 * @property {string} created_at
 * @property {string} notes
 */

const validateTransaction = (t) => {
    if (typeof t.id !== "number") throw new Error("Invalid id");
    if (!["Pending", "Cleared", "Overdue"].includes(t.payment_status))
        throw new Error("Invalid payment_status");
    if (!Number.isFinite(Number(t.amount))) throw new Error("Invalid amount");
    return true;
};

export const OperatorService = {
    getDashboard: () => api.get(`operator/dashboard/`),

    processPayment: (id, data) =>
        api.post(`operator/process/payment/${id}/`, data),

    printReceipt: (id) =>
        api.get(`operator/receipt/print/${id}/`, { responseType: 'blob' }),

    viewReceipt: (id) =>
        api.get(`operator/view/receipt/${id}/`),

    getBills: () =>
        api.get(`operator/bills/`),

    createBill: (data) =>
        api.post(`operator/create/bill/`, data),

    recordPayment: (id, data) =>
        api.post(`operator/bill/record-payment/${id}/`, data),

    generateInvoice: (id) =>
        api.get(`operator/bill/invoice/${id}/`),

    reportBill: () =>
        api.get(`operator/bill/export/`),

    billAnalysis: () =>
        api.get(`operator/bill/analytics/`),

    getBillDetail: (id) =>
        api.get(`operator/bill/detailView/${id}/`),

    updateBill: (id, data) =>
        api.patch(`operator/bill/detailView/${id}/`, data),

    deleteBill: (id) =>
        api.delete(`operator/bill/detailView/${id}/`),

    searchStaff: (query) =>
        api.get(`operator/search/`, { params: { q: query } }),

    sendReminder: (id) =>
        api.post(`operator/send/${id}/reminder/`),

    /**
     * @param {Object} filters
     * @returns {Promise<{data: {transactions: Transaction[]}}>}
     */
    getTransactions: async (filters) => {
        const response = await api.get(`operator/transaction-list/`, {
            params: filters,
        });

        const transactions = response.data?.data?.transactions || [];
        const normalizedTransactions = transactions.map((transaction) => {
            validateTransaction(transaction);
            return {
                ...transaction,
                amount: Number(transaction.amount),
                status: transaction.status || transaction.payment_status,
            };
        });
        response.data = {
            ...response.data,
            data: {
                ...response.data.data,
                transactions: normalizedTransactions,
            },
        };

        return response;
    },
    downloadInvoicePdf: (id) =>
        api.get(`operator/invoice-bill/${id}/download-pdf/`, { responseType: 'blob' }),

    exportTransactions: (params) =>
        api.get(`operator/transaction-list/export/`, {
            params,
            responseType: 'blob',
        }),
    getStaffProfile: () =>
        api.get(`operator/get/profile`),
    getStaffPhoto: (cacheKey) =>
        api.get(`operator/get/profile/photo/`, {
            responseType: 'blob',
            params: { _: cacheKey },
        }),

    updateStaffProfile: (data) =>
        api.put(`operator/update/profile`, data),
    uploadStaffPhoto: (formData) =>
        api.post(`operator/update/profile/`, formData),
};
export default OperatorService;