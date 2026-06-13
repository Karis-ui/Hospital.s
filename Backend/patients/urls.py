from django.urls import path
from . import API
from . import medical_API

urlpatterns = [
    path('patient/dashboard/',API.Patientdashboard.as_view(),name='patient_dashboard'),
    path('patient/appointment/book/',API.BookAppointment.as_view(),name='book_appointment'),
    path('view/bill/<int:pk>',API.BillingView.as_view(),name='view_bill'),
    path('patient/get/profile/',API.GetProfile.as_view(),name='get-profile'),
    path('patient/update/profile/',API.UpdateProfile.as_view(),name='update_profile'),
    path('update/profile-patient/upload-photo/',API.UpdateProfile.as_view(),name='upload-photo_patient'),
    path('update/profile-patient/delete-photo/',API.UpdateProfile.as_view(),name='delete-photo_patient'),
    path('download/report/<int:pk>/',API.DownloadReport.as_view(),name='download_report'),
    path('patient/edit/appointment/<int:pk>/',API.EditAppointment.as_view(),name='edit_appointment'),
    path('lab/result/<int:pk>/',API.LabResult.as_view(),name='lab_result'),
    path('patient/notification/',API.Notification.as_view(),name='notification'),
    path('appointment/<int:pk>/cancel/',API.CancelAppointment.as_view(),name='cancel-appointment'),
    path('appointment/<int:pk>/confirm/',API.ConfirmAppointment.as_view(),name='confirm-appointment'),
    path('patient/bills/<int:bill_id>/invoice/',API.PatientInvoice.as_view(),name='generate_invoice'),
    path('patient/bills/payment-history/',API.PaymentHistory.as_view(),name='payment_history'),
    path('patient/<int:patient_id>/appointment/',API.DetailAppointmentView.as_view(),name='appointment-view'),
    path('patient/<int:patient_id>/lab/',API.LabViews.as_view(),name='lab-view'),
    path('patient/medical-records/',medical_API.PatientMedicalView.as_view(),name='medical_records'),
    path('patient/vital-views/',medical_API.PatientVitalsView.as_view(),name='vitals-views'),
    
    path('patient/search/appointment/',API.AppointmentSearchView.as_view()),
    path('patient/search/prescription/',API.PrescriptionSearchView.as_view()),
    path('patient/search/bill/',API.BillSearchView.as_view()),
    path('patient/search/lab-result/',API.LabResultSearchView.as_view()),
    path('patient/search/doctor/',API.DoctorSearchView.as_view()),
    path('patient/search/suggestion/',API.SearchSuggestionView.as_view()),
]