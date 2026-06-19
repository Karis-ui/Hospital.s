from rest_framework.permissions import AllowAny
from django.db.models import Q
from Backend.accounts import models
from Hospital.Api.serializers import BillSerializer
from PIL.Image import module
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from time import timezone
from django.contrib.auth import get_user_model
from Hospital.Api.permissions import IsAdmin
from system.utils import get_system_settings
from core.models import Activity,AdminAnnouncement,Patient,Bill,Doctor,Appointment,AuditLog,Doctor,OperatorField,AdminReport
from Lab.models import LabTech
from system.models import SystemSettings
from Hospital.Api.serializers import DoctorSerializer,AdminReportSerializer,OperatorSerializer,PatientSerializer,AppointmentSerializer,UserSerializer,LabTechSerializer,SettingSerializer,AuditLogSerializer
from core.util.audit import log_activity
from accounts.models import CustomUser
from datetime import datetime, date, time, timedelta
from django.utils import timezone
from rest_framework.permissions import BasePermission,IsAuthenticated
from django.db.models import Count
import logging,csv,json,io
from reportlab.platypus import SimpleDocTemplate,Table,TableStyle,Paragraph,Spacer
from django.core.files.base import ContentFile
from django.core.cache import cache
from django.core.validators import validate_email
from django.core.exceptions import ValidationError,ViewDoesNotExist
from django.conf import settings as django_settings
from django.http import FileResponse
from django.core.mail import send_mail
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape

class IsAdmin(BasePermission):
    def has_permission(self,request,view):
        return(
            request.user.is_authenticated and request.user.user_type == 'admin'
        )

User = get_user_model()

class AdminDashboard(APIView):
    permission_classes = [AllowAny]
    def get(self,request):
        today = date.today()
        appointments_today = Appointment.objects.filter(appointment_date=today).select_related('doctor__user','patient__user').order_by('time')
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.count()
        total_staff = OperatorField.objects.count()
        total_appointments_today = appointments_today.count()
        completed_today = appointments_today.filter(status='Completed').count()
        recent_activities = Activity.objects.order_by('-timestamp')[:5]
        announcements = AdminAnnouncement.objects.order_by('-created_at')[:5]
        pending_approvals = CustomUser.objects.filter(
            user_type__in=['doctor','operator'],is_active=False
        )[:6]
        heatmap_data =[]
        for i in range(7):
            d= today - timedelta(days=i)
            count = Appointment.objects.filter(appointment_date=d).count()
            heatmap_data.append({
                'date': d.isoformat(),'day': d.strftime('%A'),'count': count
            })
        appointment_serializer = AppointmentSerializer(
            appointments_today[:10],many=True,context={'request': request}
        )
        
        return Response({
            'status': 'success',
            'data': {
                'date': today.isoformat(),
                'summary': {
                    'total_patients': total_patients,
                    'total_doctors': total_doctors,
                    'total_staff': total_staff,
                    'appointments_today': total_appointments_today,                        
                    'completed_today': completed_today,
                    'pending_approvals': pending_approvals
                },
                'today_appointments': appointment_serializer.data,
                'heatmap_week': heatmap_data
            }
        }, status=status.HTTP_200_OK)

class Announcement(APIView):
    permission_classes =[IsAuthenticated,IsAdmin]
    def post(self,request):
        title = request.POST.get('title')
        message = request.POST.get('message')

        announcement = AdminAnnouncement.objects.create(title=title,message=message)
        Activity.objects.create(message=f"Admin posted new announcement {title} with message {message}")
        log_activity(
            request=request,
            action='CREATE',
            module='Announcement',
            object_id=announcement.id,
            description='Admin posted new announcement {}'.format(title),
        )
        return Response({'message': 'Admin created annnouncement'},status=status.HTTP_200_OK)

class ReportGenerateView(APIView):
    permission_classes = [IsAdmin,IsAuthenticated]
    def post(self,request):
        report_type = request.data.get('report_type')
        format_type = request.data.get('format','pdf')
        date_range_start = request.data.get('date_range_start')
        date_range_end = request.data.get('date_range_end')
        filters = request.data.get('filters',{})
        report = AdminReport.objects.create(
            name=f"{report_type.replace('_',' ').title()} Report  - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            report_type=report_type,
            format=format_type,
            generated_by=request.user,
            filters=filters,
            status='generating'
        )
        try:
            if report_type == 'users':
                file_content = self.generate_user_report(format_type,date_range_start,date_range_end,filters)
            elif report_type == 'doctors':
                file_content = self.generate_doctor_report(format_type,date_range_start,date_range_end,filters)
            elif report_type == 'staff':
                file_content = self.generate_patient_report(format_type,date_range_start,date_range_end,filters)
            elif report_type == 'audit':
                file_content = self.generate_audit_report(format_type,date_range_start,date_range_end,filters)
            else:
                raise ValueError(f'Unkown report type: {report_type}')
            
            extension = 'pdf' if format_type == 'pdf' else 'xlsx' if format_type == 'excel' else 'csv'
            filename = f"{report_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')},{extension}"
            report.file.save(filename,ContentFile(file_content))
            report.status = 'Completed'
            report.file_size = len(file_content)
            report.save()
            
            AuditLog.objects.create(
                user=request.user,
                action='REPORT_GENERATE',
                module='reports',
                description=f'Generate {report_type} report',
                object_id=str(report.id),
                object_type='Report'
            )
            return Response({
                'status':'success',
                'message':'Report generated successfully',
                'data': AdminReportSerializer(report).data
            },status=status.HTTP_200_OK)
        except Exception as e:
            report.status = 'Failed'
            report.error_message = str(e)
            report.save()
            return Response({
                'status':'success',
                'message': f'Failed to generate report: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_user_report(self,format_type,start_date,end_date,filters):
        users = CustomUser.objects.all().select_related('doctor','patient')
        data = [['Username','Email','Full Name','Role','Status','Last Login']]
        for user in users:
            data.append([
                user.username,
                user.email,
                user.get_full_name(),
                user.role,
                'Active' if user.is_active else 'Inactive',
                user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None,
            ])
            
        return self.export_data(data,format_type,'user_report')
    def generate_doctor_report(self,format_type,start_date,end_date,filters):
        doctor = Doctor.objects.all().select_related('user')
        data = [['Name','Speciality','Department','Phone','Status','Email']]
        for user in doctor:
            data.append([
                user.full_name,
                user.speciality,
                user.department,
                user.phone_number,
                user.status,
                user.email,
                'Available' if user.is_available else 'Unavailable',
                user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None,
            ])
            
        return self.export_data(data,format_type,'doctor_report')
    def generate_patients_report(self,format_type,start_date,end_date,filters):
        patient = Patient.objects.all()
        data = [['Name','Gender','Age','Email','Address','Phone']]
        for user in patient:
            data.append([
                f"{user.first_name} {user.last_name}",
                user.gender,
                user.age,
                user.email,
                user.address,
                user.phone,
            ])
            
        return self.export_data(data,format_type,'patient_report')
    def generate_staff_report(self,format_type,start_date,end_date,filters):
        operator = OperatorField.objects.all()
        data = [['Name','Department','Qualification','Email','Shift Time','Phone']]
        for user in operator:
            data.append([
                user.full_name,
                user.department,
                user.qualification,
                user.email,
                user.shift_time,
                user.phone_number,
            ])
            
        return self.export_data(data,format_type,'staff_report')  
    
    def generate_audit_report(self,format_type,start_date,end_date,filters):
        logs = AuditLog.objects.all().select_related('user')
        
        if start_date:
            logs = logs.filter(timestamp__gte=start_date)
        if end_date:
            logs = logs.filter(timestamp__lte=end_date)
        data = [['Timestamp','User','Action','Module','Description','IP Address','Success']]
        for log in logs:
            data.append([
                log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                log.user.username if log.user else 'System',
                log.action,
                log.module,
                log.description[:100],
                log.ip_address or 'N/A',
                'Yes' if log.success else 'Null'
            ])
            
        return self.export_data(data,format_type,'audit_report')  
    
    def export_data(self,format_type,data,filename):
        if format_type == 'csv':
            output = io.StringIO()
            writer =  csv.writer(output)
            writer.writerows(data)
            return output.getvalue().encode('utf-8')
        elif format_type == 'pdf':
            output = io.BytesIO()
            doc = SimpleDocTemplate(output,pagesize=landscape(letter))
            styles = getSampleStyleSheet()
            story = []
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#1a2639'),
                spaceAfter=30
            )
            story.append(Paragraph(f"{filename.replace('_',' ').title()}",title_style))
            story.append(Spacer(1,12))
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a2639')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(table)
            doc.build(story)
            return output.getvalue()
        else:
            return json.dumps(data).encode('utf-8')

class DownloadReport(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request,report_id):
        try:
            report = AdminReport.objects.get(id=report_id)
            if not report.file:
                return Response({
                    'status':'error','message':'Report file missing.'
                },status=status.HTTP_404_NOT_FOUND)
            
            report.download_count += 1
            report.last_download_at = timezone.now()
            report.save()
            AuditLog.objects.create(
                user=request.user,
                action='REPORT_DOWNLOAD',
                module='reports',
                description=f"Download Report: {report.name}",
                object_id=str(report.id),
                object_type='Report'
            )
            
            return FileResponse(
                report.file.open('rb'),
                as_attachment=True,
                filename=report.file.name.split('/')[-1]
            )
        except AdminReport.DoesNotExist:
            return Response({
                'status':'error',
                'message':'Report file missing',
            },status=status.HTTP_404_NOT_FOUND)

class DeleteReport(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request,report_id):
        try:
            report = AdminReport.objects.get(id=report_id)
            if not report.file:
                return Response({
                    'status':'error','message':'Report file missing.'
                },status=status.HTTP_404_NOT_FOUND)
            
            report.delete()
            AuditLog.objects.delete(
                user=request.user,
                action='DELETE REPORT',
                module='reports',
                description=f"Delete Report: {report.name}",
                object_id=str(report.id),
                object_type='Report'
            )
            
            return Response({
                'message':'Report deleted successfully.'
            },status=status.HTTP_404_NOT_FOUND)
        except AdminReport.DoesNotExist:
            return Response({
                'status':'error',
                'message':'Report file missing',
            },status=status.HTTP_404_NOT_FOUND)

class Livedata(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self, request):

        today = date.today()

        logins_today = 0  
        active_sessions = 0 

        appointments_today = Appointment.objects.filter(
            appointment_date=today
        ).count()

        revenue_today = Bill.objects.filter(
            date=today,
            payment_status='Cleared'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0

        cleared_today = Bill.objects.filter(
            date=today,
            payment_status='Cleared'
        ).count()

        alerts_count = 0
        pending_tasks = 0

        return Response({
            'logins_today': logins_today,
            'active_sessions': active_sessions,
            'appointments_today': appointments_today,
            'revenue_today': float(revenue_today),
            'cleared_today': cleared_today,
            'alerts_count': alerts_count,
            'pending_tasks': pending_tasks,
        }, status=status.HTTP_200_OK)

class AdminChartDataAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        labels = []
        admissions = []
        discharges = []
        appointments = []
        revenue = []

        for i in range(29, -1, -1):
            d = date.today() - timedelta(days=i)
            labels.append(d.strftime('%b %d'))

            daily_appointments = Appointment.objects.filter(
                appointment_date=d
            ).count()

            daily_revenue = Bill.objects.filter(
                date=d,
                payment_status='Cleared'
            ).aggregate(
                total=models.Sum('amount')
            )['total'] or 0

            admissions.append(daily_appointments)
            discharges.append(0)  
            appointments.append(daily_appointments)
            revenue.append(float(daily_revenue))

        return Response({
            'dates': labels,
            'admissions': admissions,
            'discharges': discharges,
            'appointments': appointments,
            'revenue': revenue,
        }, status=status.HTTP_200_OK)
        
class AllUsers(APIView):
    permission_classes = [IsAdmin,IsAuthenticated]
    def get(self,request):
        data = {
            'doctors': UserSerializer(Doctor,many=True).data,
            'patients': UserSerializer(Patient,many=True).data,
            'staff': UserSerializer(OperatorField,many=True).data,
            'lab_tech': UserSerializer(LabTech,many=True).data
        }
        return Response(data)

class GetUser(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request,id):
        try:
            user = User.objects.get(id=id)
            serializer = UserSerializer(user)
            return Response({'status': 'success','data':serializer.data})
        except CustomUser.DoesNotExist:
            return Response({'status':'error', 'message': 'user not found'},status=status.HTTP_404_NOT_FOUND)
    
    @transaction.atomic
    def patch(self,request,id):
        try:
            user = User.objects.get(id=id)
            data = request.data
            base_fields = ['full_name','first_name','last_name','email','phone','role','is_active','is_staff','role']
            for field in base_fields:
                if field in request.data:
                    setattr(user,field,request.data[field])
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            user.save()
            if user.role == 'doctor' or (data.get('role') == 'doctor'):
                doctor,create = Doctor.objects.get_or_create(user=user)
                
                doctor_field = [
                    'full_name','email','date_of_birth','gender','speciality','department','phone_number','qualifications','license_number','is_available'
                ]
                for field in doctor_field:
                    if field in data:
                        if field == 'full_name':
                            setattr(doctor,'full_name',data[field])
                            name_parts = data[field].split(' ',1)
                            user.first_name = name_parts[0]
                            user.last_name = name_parts[1] if len(name_parts) > 1 else ""
                            user.save()
                        elif field == 'phone_number':
                            setattr(doctor,'phone_number',data[field])
                        elif field == 'email':
                            setattr(doctor,'email',data[field])
                        elif field == 'is_available':
                            setattr(doctor, 'is_available', data[field])
                        else:
                            setattr(doctor, field, data[field])
                doctor.save()
                
            elif user.role == 'patient' or (data.get('role') == 'patient'):
                patient, created = Patient.objects.get_or_create(user=user)
                
                patient_fields = [
                    'first_name', 'last_name', 'gender', 'age', 'phone', 'email',
                    'address', 'medical_history', 'blood_group', 'allergies',
                    'age', 'patient_photo'
                ]
                
                for field in patient_fields:
                    if field in data:
                        if field == 'first_name':
                            setattr(patient, 'first_name', data[field])
                            user.first_name = data[field]
                            user.save()
                        elif field == 'last_name':
                            setattr(patient, 'last_name', data[field])
                            user.last_name = data[field]
                            user.save()
                        elif field == 'phone':
                            setattr(patient, 'phone', data[field])
                        elif field == 'email':
                            setattr(patient, 'email', data[field])
                        else:
                            setattr(patient, field, data[field])
                
                patient.save()
                
            elif user.role == 'lab_technician' or (data.get('role') == 'lab_technician'):
                labtech, created = LabTech.objects.get_or_create(user=user)
                
                labtech_fields = [
                    'full_name', 'email', 'date_of_birth', 'gender', 'phone_number',
                    'qualifications', 'license_number', 'is_available', 'available',
                    'shift_time', 'department'
                ]
                
                for field in labtech_fields:
                    if field in data:
                        if field == 'full_name':
                            setattr(labtech, 'full_name', data[field])
                            name_parts = data[field].split(' ', 1)
                            user.first_name = name_parts[0]
                            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                            user.save()
                        elif field == 'phone_number':
                            setattr(labtech, 'phone_number', data[field])
                        elif field == 'is_available':
                            setattr(labtech, 'is_available', data[field])
                            setattr(labtech, 'available', data[field])
                        else:
                            setattr(labtech, field, data[field])
                
                labtech.save()
            
            elif user.role == 'operator' or (data.get('role') == 'operator'):
                operator, created = OperatorField.objects.get_or_create(user=user)
                
                operator_fields = [
                    'full_name', 'email', 'gender', 'phone_number','qualification',
                    'shift_time', 'department'
                ]
                
                for field in operator_fields:
                    if field in data:
                        if field == 'full_name':
                            setattr(operator, 'full_name', data[field])
                            name_parts = data[field].split(' ', 1)
                            user.first_name = name_parts[0]
                            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                            user.save()
                        elif field == 'phone_number':
                            setattr(operator, 'phone_number', data[field])
                        elif field == 'is_available':
                            setattr(operator, 'is_available', data[field])
                        else:
                            setattr(operator, field, data[field])
                
                labtech.save()
                
            elif user.role == 'admin':
                if 'full_name' in data:
                    name_parts = data['full_name'].split(' ', 1)
                    user.first_name = name_parts[0]
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                    user.save()
                
                if 'phone' in data:
                    pass
            serializer = UserSerializer(user)
            return Response({
                'status': 'success',
                'message': f'User {user.username} updated sucessfully',
                'data': serializer.data
            })
        except User.DoesNotExist:
            return Response({'status':'error', 'message':'User not found'},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'error','message':f'Update failed: {str(e)}'},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @transaction.atomic
    def delete(self,request,id):
        try:
            user = User.objects.get(id=id)
            if user.id == request.user.id:
                return Response({
                    'status':'error','message':'Cannot delete this account.'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if hasattr(user,'doctor'):
                user.doctor.delete()
            if hasattr(user,'patient'):
                user.patient.delete()
            if hasattr(user,'lab_technician'):
                user.lab_technician.delete()
            if hasattr(user,'operator'):
                user.operator.delete()
            
            username = user.username
            user.delete()
            
            return Response({
                'status': 'success',
                'message': f'User {username} deleted successfully.'
            })
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            },status=status.HTTP_404_NOT_FOUND)

class PatientGet(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

class DoctorGet(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        doctors = Doctor.objects.all()
        return Response({
            'message': 'Doctors Fetched successfully'
        },status=status.HTTP_302_FOUND)

class OperatorGet(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        operators = OperatorField.objects.all()
        serializer = OperatorSerializer(operators,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

class LabGet(APIView):
    permission_classes = [IsAdmin,IsAuthenticated]
    def get(self,request):
        lab_tech = LabTech.objects.all()
        serializer = LabTechSerializer(lab_tech,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

class DeleteUser(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def delete(self,request,user_id):
        user = get_object_or_404(CustomUser,id=user_id)
        user.delete()
        return Response({
            'message': "User deleted successfully"
        },status=status.HTTP_204_NO_CONTENT)

class PatientEdit(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def put(self,request,pk):
        try:
            patient = get_object_or_404(Patient,pk=pk)
            data = request.data
            edit_fields = [
                'first_name','last_name','gender','phone','email','address','age'
            ]
            updated_fields = []
            for field in edit_fields:
                if field in data:
                    setattr(patient,field,data[field])
                    updated_fields.append(field)
                    
            patient.save()
            serializer = PatientSerializer(patient,context={'request': request})
            return Response({
                'status':'success',
                'message': 'Patient updated successfully',
                'updated_fields': updated_fields,
                'data': serializer.data
            },status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Patient not found'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'message': f'Error updating patient: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class AdminSchedule(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        try:
            date_param = request.get('date')
            if date_param:
                try:
                    schedule_date = date.fromisoformat(date_param)
                except ValueError:
                    return Response({
                        'status': 'error',
                        'message': 'Invalid date format. Use YYYY-MM-DD'
                    },status=status.HTTP_400_BAD_REQUEST)
            else:
                schedule_date = date.today()
            
            doctors = Doctor.objects.select_related('user').all()
            staff = OperatorField.objects.select_related('user').all()
            appointments = Appointment.objects.filter(appointment_date=schedule_date).select_related('doctor__user','patient__user').order_by('time')
            doctor_serializer = DoctorSerializer(doctors,many=True,context={'requests':request})
            staff_serializer = OperatorSerializer(staff,many=True,context={'requests':request})
            appointment_serializer = AppointmentSerializer(appointments,many=True,context={'requests':request})
            
            total_appointments = appointments.count()
            completed = appointments.filter(status='Completed').count()
            pending = appointments.filter(status='Pending').count()
            cancelled = appointments.filter(status='Cancelled').count()
            
            return Response({
                'status': 'success',
                'data': {
                    'date': schedule_date.isoformat(),
                    'day_of_week': schedule_date.strftime('%A'),
                    'summary': {
                        'total_appointments': total_appointments,
                        'completed': completed,
                        'pending': pending,
                        'cancelled': cancelled,
                        'active_doctors': doctors.count(),
                        'active_staff': staff.count(),
                    },
                    'doctors': doctor_serializer.data,
                    'staff': staff_serializer.data,
                    'appointments': appointment_serializer.data,
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentHeatmapAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            
            if days > 365:
                days = 365
            if days < 1:
                days = 30
            direction = request.query_params.get('direction', 'past')
            
            today = date.today()
            
            if direction == 'past':
                start_date = today - timedelta(days=days)
                end_date = today
            else:
                start_date = today
                end_date = today + timedelta(days=days)
            
            appointments_by_date = Appointment.objects.filter(
                appointment_date__range=[start_date, end_date]
            ).values('appointment_date').annotate(
                count=Count('id')
            ).order_by('appointment_date')
            
            heatmap_data = []
            current_date = start_date
            
            date_count_dict = {item['appointment_date']: item['count'] for item in appointments_by_date}
            
            while current_date <= end_date:
                count = date_count_dict.get(current_date, 0)
                heatmap_data.append({
                    "date": current_date.isoformat(),
                    "day": current_date.strftime('%A'),
                    "day_of_week": current_date.weekday(),
                    "month": current_date.strftime('%B'),
                    "month_num": current_date.month,
                    "year": current_date.year,
                    "count": count,
                    "density": self.get_density_level(count)
                })
                current_date += timedelta(days=1)
            
            total_appointments = sum(item['count'] for item in heatmap_data)
            avg_per_day = total_appointments / days if days > 0 else 0
            
            if heatmap_data:
                max_day = max(heatmap_data, key=lambda x: x['count'])
                min_day = min(heatmap_data, key=lambda x: x['count'])
            else:
                max_day = {'date': '', 'count': 0}
                min_day = {'date': '', 'count': 0}
            
            peak_hours = self.get_peak_hours(start_date, end_date)
            
            return Response({
                'status': 'success',
                'data': {
                    'period': {
                        'start_date': start_date.isoformat(),
                        'end_date': end_date.isoformat(),
                        'days': days,
                        'direction': direction
                    },
                    'summary': {
                        'total_appointments': total_appointments,
                        'average_per_day': round(avg_per_day, 2),
                        'busiest_day': max_day,
                        'quietest_day': min_day,
                        'busiest_day_of_week': self.get_busiest_day_of_week(start_date, end_date),
                        'peak_hours': peak_hours
                    },
                    'heatmap': heatmap_data
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': 'Invalid date format or days parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_density_level(self, count):
        if count == 0:
            return 'none'
        elif count <= 5:
            return 'very_low'
        elif count <= 10:
            return 'low'
        elif count <= 20:
            return 'medium'
        elif count <= 30:
            return 'high'
        else:
            return 'very_high'
    
    def get_busiest_day_of_week(self, start_date, end_date):
        from django.db.models import Count
        from django.db.models.functions import ExtractWeekDay
        
        result = Appointment.objects.filter(
            appointment_date__range=[start_date, end_date]
        ).annotate(
            weekday=ExtractWeekDay('appointment_date')
        ).values('weekday').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        if result:
            days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            return {
                'day': days[result['weekday'] - 1],
                'count': result['count']
            }
        return None
    
    def get_peak_hours(self, start_date, end_date):
        from django.db.models import Count
        from django.db.models.functions import ExtractHour
        
        hours = Appointment.objects.filter(
            appointment_date__range=[start_date, end_date],
            time__isnull=False
        ).annotate(
            hour=ExtractHour('time')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        peak_hours = []
        for hour_data in hours:
            hour = hour_data['hour']
            if hour < 12:
                period = 'AM'
            elif hour == 12:
                period = 'PM'
            else:
                hour = hour - 12
                period = 'PM'
            
            peak_hours.append({
                'hour': f"{hour}:00 {period}",
                'count': hour_data['count']
            })
        
        return peak_hours
class PendingApprovals(APIView):
    permission_classes = [IsAdmin,IsAuthenticated]
    def get(self,request):
        data = {
            'doctors': DoctorSerializer(is_approved=False,many=True
            ).data,
            
            'operators': OperatorSerializer(is_approved=False,many=True
            ).data,
            
            'lab_tech': LabTechSerializer(is_approved=False,many=True
            ).data,
        }
        return Response(data)
            
class DeactivateUser(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def post(self,request, user_id):
        try:
            user = get_object_or_404(User,id=user_id)
            user.is_active = False
            user.save(update_fields=['is_active','uploaded_at'])
            username= user.username
            user_type = user.user_type
            
            AuditLog.objects.create(
                user=request.user,
                action='DEACTIVATE_USER',
                module='CustomUser',
                object_id=user.id,
                description=f'Admin deactivated user: {user.username}',
                ip_address=self.get_client_ip(request)
            )
            return Response({'status':'success','message':f'User {user.username} has been deactivated.'},status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({
                'status':'error',
                'message':'User not found'
            },status=status.HTTP_404_NOT_FOUND)
            
class SetApproval(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def post(self,request, user_id):
        try:
            user = get_object_or_404(User,id=user_id)
            if user.user_type not  in ['doctor','operator']:
                return Response({
                    'status':'error',
                    'meaasge': "Only doctors and operators can be approved"
                },status=status.HTTP_400_BAD_REQUEST)
            user.is_active = True
            user.is_approved = True
            user.save(update_fields=['is_active','uploaded_at'])
            
            AuditLog.objects.create(
                user=request.user,
                action='APPROVE_USER',
                module='CustomUser',
                object_id=user.id,
                description=f'Admin approved user: {user.username} as {user.user_type}',
                ip_address=self.get_client_ip(request)
            )
            return Response({'status':'success','message':f'User {user.username} has been approved.'},status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({
                'status':'error',
                'message':'User not found'
            },status=status.HTTP_404_NOT_FOUND)

    def delete(self,request,user_id):
        try:
            user = get_object_or_404(User,id=user_id)
            username = user.username
            user_type = user.user_type
            AuditLog.objects.create(
                user = request.user,
                action = 'DELETE_USER',
                module = 'CustomUser',
                object_id = user_id,
                description = f'Admin rejected and deleted user: {username} ({user_type})',
                ip_address = self.get_client_ip(request)
            )
            user.delete()
            return Response({
                'status':'success',
                'message':f'User {username} has been rejected and deleted',
                'data':{
                    'username': username,
                    'user_type': user_type
                }
            },status=status.HTTP_404_NOT_FOUND)
        except user.DoesNotExist:
            return Response({
                'status':'error',
                'message': 'User missing'
            },status=status.HTTP_404_NOT_FOUND)

    def get_client_ip(self,request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AdminSearch(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        query = request.GET.get('q','')
        search_type = request.GET.get('type','all')
        results = {}
        
        if search_type in ['all','users']:
            users = CustomUser.objects.filter(
                Q(first_name__icontains=query)|
                Q(last_name__icontains=query)|
                Q(email__icontains=query)|
                Q(username__icontains=query)
            )[:20]
            results['users'] = UserSerializer(users,many=True).data
            
        if search_type in ['all','appointments']:
            appointments = Appointment.objects.filter(
                Q(patient__first_name__icontains=query)|
                Q(patient__last_name__icontains=query)|
                Q(doctor__user__full_name__icontains=query)
            )[:20]
            results['appointments'] = AppointmentSerializer(appointments,many=True).data
            
        if search_type in ['all','bills']:
            bills = Bill.objects.filter(
                Q(patient__first_name__icontains=query)|
                Q(patient__last_name__icontains=query)|
                Q(description__icontains=query)
            )[:20]
            results['bills'] = BillSerializer(bills,many=True).data
        
        return Response({
            'query': query,'search_type': search_type,'total': sum(len(data) for data in results.values()),'results': results
        })

logger = logging.getLogger(__name__)

class SettingsView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    
    def get(self,request):
        cached_settings = cache.get('system_settings')
        if cached_settings:
            return Response({
                'status': 'success',
                'message': 'Settings fetched from cache',
                'data': cached_settings
            }, status=status.HTTP_200_OK)
        
        settings,created = SystemSettings.objects.get_or_create(id=1)
        serializer = SettingSerializer(settings)
        cache.set('system_settings',serializer.data,3600)
        return Response({
            'status': 'success',
            'message': 'Settings fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    def patch(self,request):
        settings,created = SystemSettings.objects.get_or_create(id=1)
        serializer = SettingSerializer(settings,data=request.data,partial=True)
        if serializer.is_vaild():
            serializer.save()
            cache.delete('system_settings')
            logger.info(f"Admin {request.user.username} updated system settings: {serializer.data}")
            return Response({
                'status': 'success',
                'message': 'Settings updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Invalid data',
            'errors': serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)

class TestEmailView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def post(self,request):
        test_email = request.data.get('test_email',request.user.email)
        try:
            validate_email(test_email)
        except ValidationError:
            return Response({
                'status': 'error',
                'message': 'Invalid email address'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            send_mail(
                subject='✅ Test Email from SmartCare Hospital Management System',
                message=f"""
                Hello,
                
                This is a test email from your Hospital Management System.
                
                If you're receiving this, your email configuration is working correctly!
                
                Sent by: {request.user.get_full_name() or request.user.username}
                Time: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
                
                Best regards,
                SmartCare Management System
                """,
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_email],
                fail_silently=False,
            )
            return Response({
                'status': 'success',
                'message': 'Test email sent successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f'Email test failed: {str(e)}')
            return Response({
                'status':'error','message':f'Failed to send email: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BackUpView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    def get(self,request):
        try:
            settings = SystemSettings.objects.get(id=1)
            backup_data = {
                'timestamp': datetime.now().isoformat(),
                'settings' : {
                    'timezone': settings.timezone,
                    'working_hours_stats': str(settings.working_hours_start),
                'working_hours_end': str(settings.working_hours_end),
                'appointment_duration': settings.appointment_duration,
                'session_timer': settings.session_timer,
                'factor_auth': settings.factor_auth,
                'password_expiry': settings.password_expiry,
                'email_enabled': settings.email_enabled,
                'theme': settings.theme,
                'primary_color': settings.primary_color,
                'data_retention_days': settings.data_retention_days,
            }
        }
        except Exception as e:
            logger.error(f'Backup failed: {str(e)}')
            return Response({
                'status': 'error','message':f'Backup failed: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'status': 'success','message':f'Backup created successfully'
        },status=status.HTTP_200_OK)

class AuditView(APIView):
    permission_classes = [IsAdmin,IsAuthenticated]
    def get(self,request,log_id):
        try:
            log = AuditLog.objects.select_related('user').get(id=log_id)
            serializer = AuditLogSerializer(log)
            return Response({
                'statud':'success','message':serializer.data
            })
        except AuditLog.DoesNotExist:
            return Response({
                'status':'error','message':'Log entry missing!'
            },status=status.HTTP_404_NOT_FOUND)
        stats = {
            'total': AuditLog.objects.count(),
            'today': AuditLog.objects.filter(timestamp__date=timezone.now().date()).count(),
            'yesterday': AuditLog.objects.filter(timestamp__date=timezone.now().date() - timedelta(days=1)).count(),
            'this_week': AuditLog.objects.filter(timestamp__date=timezone.now().date() - timedelta(days=7)).count(),
            'this_month': AuditLog.objects.filter(timestamp__date=timezone.now().date() - timedelta(days=30)).count(),
        }
        top_users = AuditLog.objects.values('user__username').annotate(count=Count('id')).order_by('-count')[:10]
        stats['top_users'] = list(top_users)
        top_actions = AuditLog.objects.values('action').annotate(count=Count('id')).order_by('-count')[:10]
        stats['top_users'] = list(top_actions)
        
        hourly = []
        for i in range(24):
            hour_start = timezone.now() - timedelta(hours=i+1)
            hour_end = timezone.now() - timedelta(hours=i)
            count = AuditLog.objects.filter(timestamp__gte=hour_start,timestamp__lte=hour_end).count()
            hourly.append({'hour':hour_start.hour,'count':count})
        stats['hourly_activity'] = hourly[::-1]
        
        return Response({
            'status':'success','data':stats
        })
    