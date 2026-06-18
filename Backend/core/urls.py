from django.urls import path
from . import views,view_appointments
from django.http import JsonResponse

urlpatterns = [
    path('home/',views.Home.as_view(),name='home'),
    path('patient/list/',views.PatientList.as_view(),name='patient_list'),
    path('secure/download/<int:report_id>/',views.SecureReportDownload.as_view(),name='secure_download'),
    path('notification/',views.Notification.as_view(),name='notification'),
    path('mark/notification/',views.MarkNotification.as_view(),name='mark_notification'),
    path('mark/notifications/',views.MarkNotifications.as_view(),name='mark_notifications'),
    path('announcement/',views.Annnouncements.as_view(),name='announcements'),
    path('random/book/appointment/',view_appointments.BookAppointment.as_view(),name='book_appointment'),
    path('emergency/',view_appointments.EmergencyAppointment.as_view(),name='emergency'),
    path('appointment/list/',view_appointments.AppointmentList.as_view(),name='appointment_list'),
    path('appointments/<int:appointment_id>/reschedule/',view_appointments.RescheduleAppointment.as_view(),name='reschedule'),
]
