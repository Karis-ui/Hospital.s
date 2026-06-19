from django.db.models import Q
from datetime import timezone
from ipaddress import ip_address
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.utils import slot_available
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.contrib.auth.views import AuthenticationForm
from django.contrib.auth.models import User
from core.models import Patient, Report, ReportAccessLog, Doctor, Appointment,AdminAnnouncement,Notification,Activity
from Hospital.Api.serializers import AppointmentSerializer,ReportSerializer,PatientSerializer,DoctorSerializer,AuditLogSerializer,NotificationSerializer
from Hospital.Api.permissions import IsAdmin,IsDoctor,IsPatient
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.http import FileResponse, HttpResponseNotFound, HttpResponseForbidden
from django.core.paginator import Paginator
from system.utils import get_system_settings
from .forms import AppointmentForm
from django.utils import timezone
from django.db import transaction
from Hospital.settings import EMAIL_HOST_USER,EMERGENCY_CONTACT

class Home(APIView):
    permission_classes = [AllowAny]
    def get(self,request):
        try:
            settings = get_system_settings()
            today = timezone.now().date()
            
            total_doctors = Doctor.objects.filter(user__is_approved=True).count()
            total_appointments = Appointment.objects.filter(status='Completed').count()
            appointments_today = Appointment.objects.filter(appointment_date=today).count()
            featured_doctors = Doctor.objects.select_related('user').filter(user__is_approved=True).order_by('-user__date_joined')[:4]
            
            upcoming_appointments = Appointment.objects.filter(appointment_date__gte=today).order_by('appointment_date')[:4]
            announcements = AdminAnnouncement.objects.filter(created_at__date=today)
            doctor_serializer = DoctorSerializer(featured_doctors,many=True,context={'request',request})
            home_data = {
                'hospital_info':{
                    'name': settings.hospital_name if settings else 'SmartCare Hospital',
                    'tagline': 'Quality Healthcare for all',
                    'description': 'SmartCare Hospital provides comprehensive health care with most recent and specialized personel as well as state-of-the-art facilities.',
                    'address': '485 Fifth Avenue, Kagwe town',
                    'email': EMAIL_HOST_USER,
                    'emergency_contact': EMERGENCY_CONTACT,
                    'visiting_hours': '24/7 Emergency Services',
                },
                'statistics':{
                    'appointments': total_appointments,
                    'doctors': total_doctors,
                    'appointments_today': appointments_today,
                    'statisfaction_rate': '98%',
                    'ambulance_services': 'available',
                },
                'featured_doctors': doctor_serializer.data,
                'departments':[
                    {'name':'Radiology','icon':'fa-xray','description':'Imanging services','doctors_count':'6'},
                    {'name':'Cardiology','icon':'fa-heart','description':'Heart Sservices','doctors_count':'4'},
                    {'name':'Pediactrics','icon':'fa-brain','description':'Child health care','doctors_count':'4'},
                    {'name':'Emergency','icon':'fa-ambulance','description':'24/7 Emergency services','doctors_count':'10'},
                ],
                'services':[
                    {'name':'Emergency Care','icon':'fa-truck-medical','description':'24/7 Emergency services'},
                    {'name':'Pharmacy','icon':'fa-pills','description':'Expertise medication'},
                    {'name':'Laboratory','icon':'fa-flask','description':'Proffesional lab skills available'},
                    {'name':'Outpatient','icon':'fa-user-md','description':'Consultation & Check-up services'},
                    {'name':'Inpatient','icon':'fa-procedures','description':'Readily available ward both Male and Female'},
                ],
                'quick_actions':[
                    {'name':'Book Appointment','icon':'fa-calendar-check','url':'/appointment/book/'},
                    {'name':'Patient Account','icon':'fa-hospital-user','url':'/login/'},
                    {'name':'Contact Us','icon':'fa-envelope','url':'/contact'},
                    {'name':'Emergency','icon':'fa-phone-alt','url':'/emrgency'},
                ]
            }
            return Response({
                'status': 'success',
                'data': home_data
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class PatientList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        try:
            if request.user.user_type not in ['admin','doctor']:
                return Response({
                    'Message': 'You are not authorized for this page!'
                },status=status.HTTP_403_FORBIDDEN)
                
            patients = Patient.objects.all().order_by('-created_at')
            search = request.query_params.get('search')
            if search:
                patients = patients.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(phone__icontains=search)
                )
            page = int(request.query_params.get('page',1))
            page_size = int(request.query_params.get('page_size',20))
            paginator = Paginator(patients,page_size)
            current_page = paginator.get_page(page)
            
            serializer = PatientSerializer(
                current_page,many=True,context={'request',request}
            )
            return Response({
                'status': 'error',
                'data':{
                    'patients': serializer.data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size,
                    'total_pages': paginator.num_pages,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous(),
                } 
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
        },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SecureReportDownload(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request,token):
        try:
            report = get_object_or_404(Report,access_token=token)
            if not report.token_valid(token):
                return Response({
                    'status': 'error',
                    'Message': 'Download link expired!'
                },status=status.HTTP_403_FORBIDDEN)
            user = request.user if request.user.is_authenticated else None
            if user and user.is_authenticated:
                has_permission = (
                    user == report.patient.user or (report.doctor and user == report.doctor.user) or user.is_staff
                )
                if not has_permission:
                    return Response({
                        'status': 'error',
                        'Message': 'You are not authorized to access this report'
                    },status=status.HTTP_403_FORBIDDEN)
            report.mark_token_used()
            
            ReportAccessLog.objects.create(
                report=report,
                accessed_by=user if user and user.is_authenticated else None,
                method='link',
                ip_address=self.get_client_ip(request),
                note='Patient download via source link'
            )
            
            if report.pdf_file and report.pdf_fie.path:
                response = FileResponse(
                    open(report.pdf_file.path,'rb'),
                    content_type='application/pdf',
                )
                filename = f'{report.patient.first_name}_{report.uploaded_at}.pdf'
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                return response
        except Report.DoesNotExist:
            return Response({
                'status':'error',
                'Message': 'Report file not found'
            },status=status.HTTP_404_NOT_FOUND)


class Notification(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        notification = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notification,many=True,context={'request',request})

class Annnouncements(APIView):
    permission_classes = [AllowAny]
    def get(self,request):
        title = request.data.get('title')
        message = request.data.get('message')
        announcement = AdminAnnouncement.objects.create(title=title,message=message)
        log_activity = Activity.objects.create(
            request=request,
            action='CREATE',
            module='Announcement',
            object_id=announcement.id,
            description='Admin posted new announcement {}'.format(title),
        )
        return Response({'message': 'Admin created annnouncement'},status=status.HTTP_200_OK)

class MarkNotification(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self,request,pk):
        try:
            notification = Notification.objects.get(pk=pk,user=request.user)
        
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            
            return Response({'message': 'Notification marked as read'},status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Notification not found'
            },status=status.HTTP_404_NOT_FOUND)
    def delete(self,request,pk):
        try:
            notification = Notification.objects.get(pk=pk,user=request.user)
        
            notification.delete()
            return Response({'message': 'Notification deleted'})
        except Notification.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Notification not found'
            },status=status.HTTP_404_NOT_FOUND)

class MarkNotifications(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self,request):
        notification = Notification.objects.get(user=request.user,is_read=False).update(is_read=True)
        return Response({'message': 'All unread notifications marked as read'},status=status.HTTP_200_OK)
        
    def delete(self,request):
        notification = Notification.objects.get(user=request.user)
        return Response({'message': 'All notifications deleted'})