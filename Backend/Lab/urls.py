from django.urls import path
from . import API
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('dashboard/',API.DashboardAnalytics.as_view(),name='lab_dashboard'),
    path('lab_report/<int:request_id>/',API.LabReport.as_view(),name='lab_report_upload'),
    path('labTechnician/detail_view/<int:request_id>/request/',API.DetailLabRequest.as_view(),name='lab_detail_request_view'),
    path('labTechnician/detail_view/<int:request_id>/report/',API.DetailLabReport.as_view(),name='lab_detail_report_view'),
    path('request/status/<int:request_id>/update/',API.UpdateLabRequestStatus.as_view(),name='update_lab_request_status'),
    path('report/<int:request_id>/update/',API.UpdateLabReport.as_view(),name='update_lab_report'),
    path('labTechnician/report/<int:request_id>/upload/',API.UploadLabReport.as_view(),name='upload_lab_report'),
    path('result/<int:request_id>/approve/',API.ApproveLabResults.as_view(),name='lab_approve_result'),
    path('result/<int:request_id>/reject/',API.RejectResult.as_view(),name='lab_reject_result'),
    path('send/to/doctor/<int:bill_id>/',API.SendToDoctor.as_view(),name='send_to_doctor'),
    path('search/lab-views/',API.LabSearch.as_view(),name='search'),
    path('lab/request-list/',API.LabRequestList.as_view(),name='lab_request_list'),
    path('lab/report-list/',API.LabReportList.as_view(),name='lab_report_list'),
    path('lab/patient/<int:patient_id>/history/',API.PatientLabHistory.as_view(),name='patient_lab_history'),
    path('lab/profile/',API.GetLabTechProfile.as_view(),name='profile'),
    path('lab/profile/update/',API.UpdateLabProfile.as_view(),name='update-profile'),
    path('update/profile-lab/upload-photo/',API.UpdateLabProfile.as_view(),name='upload-photo_lab'),
    path('update/profile-lab/delete-photo/',API.UpdateLabProfile.as_view(),name='delete-photo_lab'),
    path('lab/stats/',API.LabStats.as_view(),name='lab_stats'),
    
    path('lab/test-profile/list/',API.TestProfileListView.as_view(),name='test_profile_list'),
    path('lab/test-profile/<int:profile_id>/detail/',API.TestProfileDetailView.as_view(),name='test_profile'),
    path('lab/entry-result/<int:request_id>/detail/',API.GetResultEntryView.as_view(),name='result_entry'),
    path('lab/save-result/<int:request_id>/',API.SaveStructuredResultsView.as_view(),name='save_result_entry'),
    path('lab/get/<int:request_id>/result/structured/',API.GetStructuredResultsView.as_view(),name='get_structured_result'),
    
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)