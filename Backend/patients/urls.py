from django.urls import path
from . import API
from . import medical_API

urlpatterns = [
    path('dashboard/',API.Patientdashboard.as_view(),name='patient_dashboard'),
    path('appointment/book/',API.BookAppointment.as_view(),name='book_appointment'),
    path('view/bill/<int:pk>',API.BillingView.as_view(),name='view_bill'),
    path('get/profile/',API.GetProfile.as_view(),name='get-profile'),
    path('update/profile/',API.UpdateProfile.as_view(),name='update_profile'),
    path('update/profile/upload-photo/',API.UpdateProfile.as_view(),name='upload-photo_patient'),
    path('update/profile/delete-photo/',API.UpdateProfile.as_view(),name='delete-photo_patient'),
    path('download/report/<int:pk>/',API.DownloadReport.as_view(),name='download_report'),
    path('edit/appointment/<int:pk>/',API.EditAppointment.as_view(),name='edit_appointment'),
    path('lab/result/<int:pk>/',API.LabResult.as_view(),name='lab_result'),
    path('notification/',API.Notification.as_view(),name='notification'),
    path('appointment/<int:pk>/cancel/',API.CancelAppointment.as_view(),name='cancel-appointment'),
    path('appointment/<int:pk>/confirm/',API.ConfirmAppointment.as_view(),name='confirm-appointment'),
    path('bills/<int:bill_id>/invoice/',API.PatientInvoice.as_view(),name='generate_invoice'),
    path('bills/payment-history/',API.PaymentHistory.as_view(),name='payment_history'),
    path('<int:patient_id>/appointment/',API.DetailAppointmentView.as_view(),name='appointment-view'),
    path('<int:patient_id>/lab/',API.LabViews.as_view(),name='lab-view'),
    path('medical-records/',medical_API.PatientMedicalView.as_view(),name='medical_records'),
    path('vital-views/',medical_API.PatientVitalsView.as_view(),name='vitals-views'),
    
    path('search/appointment/',API.AppointmentSearchView.as_view()),
    path('search/prescription/',API.PrescriptionSearchView.as_view()),
    path('search/bill/',API.BillSearchView.as_view()),
    path('search/lab-result/',API.LabResultSearchView.as_view()),
    path('search/doctor/',API.DoctorSearchView.as_view()),
    path('search/suggestion/',API.SearchSuggestionView.as_view()),
]