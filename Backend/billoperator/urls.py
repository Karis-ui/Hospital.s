from django.urls import path
from . import api

urlpatterns = [
        path('operator/dashboard/', api.OperatorDashboardAPIView.as_view(), name='billing_dashboard'),
        path('process/payment/<int:bill_id>/', api.ProcessPaymentAPIView.as_view(), name='process_payment'),
        path('receipt/print/<int:bill_id>/', api.PrintReceiptAPIView.as_view(), name='print_receipt'),
        path('view/receipt/<int:bill_id>/', api.ViewReceiptAPIView.as_view(), name='view_receipt'),
        path('operator/bills/',api.BillListAPIView.as_view(), name='bill_list'),
        path('create/bill/', api.BillCreate.as_view(), name='create_bill'),
        path('bill/record-payment/<int:bill_id>/',api.RecordPaymentMethodAPIView.as_view(), name='record_payment'),
        path('bill/detailView/<int:bill_id>/',api.BillDetailAPIView.as_view(), name='bill_detail'),
        path('bill/analytics/',api.BillingAnalyticsAPIView.as_view(), name='billing_analytics'),
        path('bill/export/',api.BillingExportAPIView.as_view(), name='billing_export'),
        path('bill/invoice/<int:bill_id>/',api.BillingInvoice.as_view(), name='generate_invoice'),
        path('staff/search/',api.StaffSearch.as_view(),name='search'),
        path('send/<int:pk>/reminder/',api.SendReminder.as_view(),name='Send_reminder'),
        path('operator/transaction-list/',api.TransactionList.as_view(), name='transaction_list'),
        path('operator/transaction-list/export/', api.ExportTransaction.as_view(), name='transaction_export'),
        path('operator/get/profile/',api.GetStaffProfile.as_view(), name='get_profile'),
        path('operator/update/profile/',api.UpdateStaffProfile.as_view(), name='update_profile'),
        path('operator/invoice-bill/<int:bill_id>/download-pdf/',api.DownloadPDFView.as_view(),name='download_invoice_bill'),
]