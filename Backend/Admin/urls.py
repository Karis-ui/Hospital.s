from django.urls import path
from . import API

urlpatterns = [
    path('dashboard/my/',API.AdminDashboard.as_view(),name='admin_dashboard'),
    path('announcements/',API.Announcement.as_view(),name='announcements'),
    path('set-approval/user/<int:user_id>/',API.SetApproval.as_view(),name='set_approval'),
    path('staff/deactivate/<int:user_id>/',API.DeactivateUser.as_view(),name='deactivate_user'),
    path('appointments/heatmap/',API.AppointmentHeatmapAPIView.as_view(),name='appointment_heatmap'),
    path('admin/schedules/',API.AdminSchedule.as_view(),name='admin_schedules'),
    path('patient/edit/<int:patient_id>/',API.PatientEdit.as_view(),name='edit_patient'),
    path('delete/user/<int:user_id>/',API.DeleteUser.as_view(),name='delete_user'),
    path('admin/chart/view/',API.AdminChartDataAPIView.as_view(),name='admin_chart_data'),
    path('doctor/get/',API.DoctorGet.as_view(),name='doctor_get'),
    path('patient/get/',API.PatientGet.as_view(),name='patient_get'),
    path('operator/get/',API.OperatorGet.as_view(),name='operator_get'),
    path('live/data/',API.Livedata.as_view(),name='live_data'),
    path('admin/search/',API.AdminSearch.as_view(),name='search'),
    path('admin/all/',API.AllUsers.as_view(),name='all'),
    path('admin/user/<int:id>/detail-view/',API.GetUser.as_view(),name='getUser'),
    path('admin/approvals/pending/',API.PendingApprovals.as_view(),name='pending_approvals'),
    path('admin/system/settings/', API.SettingsView, name='settings'),
    path('admin/settings/test-mail/',API.TestEmailView.as_view(),name='test_mail'),
    path('admin/settings/backup/',API.BackUpView.as_view(),name='back_up'),
    path('admin/audits/',API.AuditView.as_view(),name='audit_view'),
    path('admin/report/generate/',API.ReportGenerateView.as_view(),name='generate_report'),
    path('admin/report/<int:report_id>/download/',API.DownloadReport.as_view(),name='download_report'),
    path('admin/report/<int:report_id>/delete/',API.DeleteReport.as_view(),name='delete_report'),
]