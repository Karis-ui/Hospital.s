from django.urls import path
from . import API,medics_API

urlpatterns = [
    path('dashboard/',API.DoctorDashboard.as_view(),name='doctor_dashboard'),
    path('patient/pdf/<int:bill_id>/',API.PatientPdf.as_view(),name='patient_pdf'),
    path('view/',API.DoctorView.as_view(),name='doctor_view'),
    path('appointment/<int:pk>/view/',API.AppointmentView.as_view(),name='appointment_view'),
    path('my/patients/',API.MyPatients.as_view(),name='my_patients'),
    path('statistics/',API.DoctorStatistics.as_view(),name='doctor_statistics'),
    path('prescriptions/',API.PrescriptionView.as_view(),name='doctor_prescriptions'),
    path('patient/detail/<int:bill_id>/',API.PatientDetail.as_view(),name='patient_detail'),
    path('reports/',API.Reports.as_view(),name='Reports'),
    path('send/to/patient/<int:bill_id>/',API.SendReportToPatient.as_view(),name='send_to_patient'),
    path('lab/requests/',API.LabRequests.as_view(),name='lab_request'),
    path('get/profile/',API.GetDoctorProfile.as_view(),name='doctor-profile'),
    path('update/profile/',API.UpdateDoctorProfile.as_view(),name='update-profile'),
    path('update/profile/upload-photo/',API.UpdateDoctorProfile.as_view(),name='upload-photo_doctor'),
    path('update/profile/delete-photo/',API.UpdateDoctorProfile.as_view(),name='delete-photo_doctor'),
    path('search/',API.DoctorSearch.as_view(),name='search'),
    
    path('get/<int:patient_id>/medical-records/',medics_API.DoctorPatientMedicalRecordsAPIView.as_view(),name='patient_medical_records'),
    path('create/<int:patient_id>/medical-records/',medics_API.CreateMedicalRecord.as_view(),name='create_medical_records'),
    path('get/<int:patient_id>/vital-views/',medics_API.DoctorPatientVitalsAPIView.as_view(),name='patient_vitals_records'),
    path('create/<int:patient_id>/vital-views/',medics_API.CreatePatientVitals.as_view(),name='create_vitals_records'),
]