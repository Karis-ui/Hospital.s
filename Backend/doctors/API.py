from django.db.models import Q
from Hospital import settings
from django.template.loader import render_to_string
from django.shortcuts import redirect
from django.contrib import messages
from reportlab.platypus import TableStyle
from reportlab.platypus import Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus.doctemplate import SimpleDocTemplate
from reportlab.platypus import Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Spacer
from reportlab.platypus import Paragraph
from django.urls import reverse
from django.core.exceptions import PermissionDenied
from django.core.files.uploadhandler import load_handler
from django.core.mail import EmailMessage
from django.shortcuts import get_object_or_404
from django.utils import (timezone)
import hashlib
from core.util.audit import log_activity
from core.models import Appointment, Patient, Report, ReportAccessLog,AuditLog,Doctor,Prescription
from Lab.models import labRequest,LabReport
from datetime import timedelta,datetime
import calendar
from django.db.models import Count
from django.core.files.base import ContentFile
from django.http import HttpResponse,FileResponse
import os
from core.util.pdf_generator import generate_pdf
from core.util.profile_photo import profile_photo_response
from core.util.email_service import send_email
from django.core.paginator import Paginator
from reportlab.lib import colors
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from Hospital.Api.permissions import IsDoctor
from Hospital.Api.serializers import DoctorSerializer, LabReportSerializer, LabRequestSerializer, PatientSerializer, AppointmentSerializer, PrescriptionSerializer, ReportSerializer
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from reportlab.lib.pagesizes import A4

class PatientPdf(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]
    def get(self,request,patient_id):
        try:
            doctor = Doctor.objects.get(user=request.user) 
            appointments = Appointment.objects.filter(doctor__user=request.user,patient__id=patient_id)
            if not appointments.exists():
                return Response({
                    'status': 'error',
                    'message': 'Access Denied!You do not have access to this patient'
                },status=status.HTTP_404_NOT_FOUND)
            patient = appointments.first().patient
            paper =  HttpResponse(content_type='application/pdf')
            paper['Content-Disposition'] = f'attachemnt; filename="{patient.first_name} {patient.last_name}.pdf"'
            doc = SimpleDocTemplate(Response,pagesize=A4)
            styles = getSampleStyleSheet()
            elements = []
            logo_path = os.path.join("static","img","logo.png")
            if os.path.exists(logo_path):
                elements.append(Image(logo_path,width=200,height=200))

            title_styles = ParagraphStyle('title',fontSize=20,alignment=1,spaceAfter=20)
            elements.append(Paragraph('<b>SMARTCARE GENERAL HOSPITAL</b>',title_styles))
            elements.append(Paragraph("<b>PATIENT MEDICAL REPORT</b>",title_styles))
            elements.append(Spacer(1,20))
            patient_info = f""""
                <b>Patient Name:</b> {patient.first_name} {patient.last_name}<br/>
                <b>Age:</b> {patient.age}<br/>
                <b>Gender:</b> {patient.gender}<br/>
                <b>Email:</b>{patient.email}<br/>
                <b>Phone:</b>{patient.phone}<br/>
                <b>Medical History:</b>{patient.medical_history or "None"}<br/>
            """
            elements.append(Paragraph("<b>PATIENT INFORMATION",styles['Heading2']))
            elements.append(Paragraph(patient_info,styles['Normal']))
            elements.append(Paragraph("<b>APPOINTMENT HISTORY<b>",styles['Heading2']))

            data = [["Date","Purpose","Status"]]
            for app in appointments:
                data.append([str(app.appointment_date),app.purpose,app.status])

            table = Table(data,hAlign="LEFT")
            table.setStyle(TableStyle([
                ('BACKGROUND',(0,0),(-1,0),colors.lightskyblue),
                ('TEXTCOLOR',(0,0),(-1,0),colors.black),
                ('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('FONTNAME',(0,0),(-1,-0),'Helvetica-Bold'),
                ('BOTTOMPADDING',(0,0),(-1,0),10),
                ('BACKGROUND',(0,0),(-1,-1),colors.whitesmoke),
                ('GRID',(0,0),(-1,-1),1,colors.green),
            ]))
            elements.append(table)
            elements.append(Spacer(1,30))

            doctor_name = f"Dr. {request.user.full_name}"
            elements.append(Paragraph("<b>Doctor:</b>" +doctor_name,styles['Normal']))
            elements.append(Spacer(1,40))
            elements.append(Paragraph("Signature: ___________________",style=styles['Normal']))
            elements.append(Spacer(1,50))
            elements.append(Paragraph("<i>System-Generated report from SMARTCARE GENERAL HOSPITAL</i>",style=styles['Normal']))
            doc.build(elements)
        except Exception as e:
            return Response({
                'Error': {str(e)}
            })

class DoctorView(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        if doctor is None:
            return Response({}, status=status.HTTP_200_OK)
        return Response(
            DoctorSerializer(doctor, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

class DoctorDashboard(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        today = timezone.localdate()
        week_dates = [today - timedelta(days=6 - index) for index in range(7)]
        empty_dashboard = {
            'doctor': None,
            'is_approved': request.user.is_approved,
            'statistics': {
                'today_appointments': 0,
                'completed_today': 0,
                'waiting': 0,
                'total_patients': 0,
                'total_appointments': 0,
                'pending_prescriptions': 0,
            },
            'appointments': {'today': [], 'upcoming': []},
            'patients': {'recent': []},
            'chart_data': {
                'labels': [day.strftime('%a') for day in week_dates],
                'values': [0] * len(week_dates),
            },
            'current_time': timezone.now().isoformat(),
        }
        doctor = Doctor.objects.select_related('user').filter(user=request.user).first()
        if doctor is None:
            return Response({'status': 'success', 'data': empty_dashboard}, status=status.HTTP_200_OK)

        appointments = Appointment.objects.filter(doctor=doctor).select_related('patient')
        today_appointments = appointments.filter(appointment_date=today)
        upcoming_appointments = appointments.filter(
            appointment_date__gte=today,
        ).exclude(status__in=['Completed', 'Cancelled'])
        patient_ids = appointments.values_list('patient_id', flat=True).distinct()
        recent_appointments = appointments.order_by(
            '-appointment_date', '-appointment_time'
        )[:5]

        chart_counts = [
            appointments.filter(appointment_date=day).count()
            for day in week_dates
        ]
        empty_dashboard.update({
            'doctor': {
                **DoctorSerializer(doctor, context={'request': request}).data,
                'first_name': doctor.user.first_name,
                'last_name': doctor.user.last_name,
            },
            'appointments': {
                'today': AppointmentSerializer(
                    today_appointments, many=True, context={'request': request}
                ).data,
                'upcoming': AppointmentSerializer(
                    upcoming_appointments, many=True, context={'request': request}
                ).data,
            },
            'patients': {
                'recent': AppointmentSerializer(
                    recent_appointments, many=True, context={'request': request}
                ).data,
            },
            'statistics': {
                'today_appointments': today_appointments.count(),
                'completed_today': today_appointments.filter(status='Completed').count(),
                'waiting': today_appointments.filter(status='Requested').count(),
                'total_patients': patient_ids.count(),
                'total_appointments': appointments.count(),
                'pending_prescriptions': Prescription.objects.filter(
                    doctor=doctor, status='active'
                ).count(),
            },
            'chart_data': {
                'labels': [day.strftime('%a') for day in week_dates],
                'values': chart_counts,
            },
        })
        return Response({'status': 'success', 'data': empty_dashboard}, status=status.HTTP_200_OK)

class GetDoctorProfile(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor_profile = Doctor.objects.filter(user=request.user).first()
        if doctor_profile is None:
            return Response({}, status=status.HTTP_200_OK)
        serializer = DoctorSerializer(doctor_profile, context={'request': request})
        return Response(serializer.data)

class GetDoctorProfilePhoto(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor = get_object_or_404(Doctor, user=request.user)
        return profile_photo_response(doctor.doctor_photo)

class UpdateDoctorProfile(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def put(self,request):
        doctor_profile = get_object_or_404(Doctor, user=request.user)
        serializer = DoctorSerializer(
            doctor_profile,data=request.data,partial=True,context={'request':request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message':'Profile updated successfully',
                'patient':serializer.data
            })
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def post(self,request):
        doctor_profile = get_object_or_404(Doctor,user=request.user)
        if 'doctor_photo' in request.FILES:
            photo = request.FILES['doctor_photo']
            allowed_extensions = ['jpg','jpeg','png','gif','webp']
            file_extension = photo.name.split('.')[-1].lower()
            
            if file_extension not in allowed_extensions:
                return Response({
                    'error': f'file type not allowed. Try {", ".join(allowed_extensions)}'
                },status = status.HTTP_400_BAD_REQUEST)
            max_size = 5 * 1024 * 1024
            if photo.size > max_size:
                return Response({
                    'error': 'File too large. Max size: 5MB'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if doctor_profile.doctor_photo:
                old_photo_path = os.path.join(settings.MEDIA_ROOT,str(doctor_profile.doctor_photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
                    
            doctor_profile.doctor_photo = photo
            doctor_profile.save()
            
            serializer = DoctorSerializer(doctor_profile,context={'request':request})
            return Response({
                'message':'Profile updated successfully',
                'data':serializer.data
            })
        return Response({
            'error': 'No profile photo was provided.'
        },status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        doctor_profile = get_object_or_404(Doctor, user=request.user)
        
        if not doctor_profile.doctor_photo:
            return Response({
                'error': 'No profile photo detected'
            }, status=status.HTTP_404_NOT_FOUND)
        
        photo_path = os.path.join(settings.MEDIA_ROOT, str(doctor_profile.doctor_photo))
        if os.path.exists(photo_path):
            os.remove(photo_path)
        
        doctor_profile.doctor_photo = None
        doctor_profile.save()
        
        return Response({
            'message': 'Profile photo deleted successfully'
        }, status=status.HTTP_200_OK)

class AppointmentView(APIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated,IsDoctor]
    def get_set(self):
        doctor = Doctor.objects.get(user=self.request.user)
        return Appointment.objects.filter(doctor=doctor).select_related('patient')

    def get(self, request, pk):
        appointment = Appointment.objects.filter(
            pk=pk, doctor__user=request.user
        ).select_related('doctor__user', 'patient').first()
        if appointment is None:
            return Response(
                {'status': 'empty', 'data': None},
                status=status.HTTP_200_OK,
            )
        return Response(
            AppointmentSerializer(appointment, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        appointment = Appointment.objects.filter(
            pk=pk, doctor__user=request.user
        ).first()
        if appointment is None:
            return Response(
                {'status': 'empty', 'data': None},
                status=status.HTTP_200_OK,
            )
        requested_status = request.data.get('status', 'Completed')
        valid_statuses = {value for value, _ in Appointment.status_choices}
        normalized_status = next(
            (value for value in valid_statuses if value.lower() == str(requested_status).lower()),
            None,
        )
        if normalized_status is None:
            return Response(
                {'status': 'error', 'message': 'Invalid appointment status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.status = normalized_status
        appointment.save(update_fields=['status'])
        return Response({
            'status': 'success',
            'data': AppointmentSerializer(
                appointment, context={'request': request}
            ).data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True,methods=['put'],url_path='confirmed')
    def confirm_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status = 'confirmed'
        appointment.save()
        return Response({'message': 'Appointment confirmed'})
    
    @action(detail=True,methods=['put'],url_path='complete')
    def complete_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status = 'completed'
        appointment.save()
        return Response({'message': 'Appointment completed'})
    
    @action(detail=True,methods=['put'],url_path='cancel')
    def cancel_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'message': 'Appointment cancelled'})

class MyPatients(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        if doctor is None:
            return Response([], status=status.HTTP_200_OK)
        patient_ids = Appointment.objects.filter(
            doctor=doctor
        ).values_list('patient_id', flat=True).distinct()
        patients = Patient.objects.filter(id__in=patient_ids).order_by(
            'first_name', 'last_name'
        )
        return Response(
            PatientSerializer(patients, many=True, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

class PrescriptionView(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        if doctor is None:
            return Response([], status=status.HTTP_200_OK)
        prescriptions = Prescription.objects.filter(
            doctor=doctor
        ).select_related('patient').order_by('-prescribed_at')
        return Response(
            PrescriptionSerializer(prescriptions, many=True).data,
            status=status.HTTP_200_OK,
        )

class DoctorStatistics(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        today = timezone.localdate()
        period = request.query_params.get('period', request.query_params.get('peroid', 'month'))
        days = {'week': 7, 'month': 30, 'year': 365}.get(period, 30)
        from_date = today - timedelta(days=days - 1)

        if doctor is None:
            appointments = Appointment.objects.none()
            prescriptions = Prescription.objects.none()
            lab_requests = labRequest.objects.none()
        else:
            appointments = Appointment.objects.filter(
                doctor=doctor, appointment_date__gte=from_date, appointment_date__lte=today
            )
            prescriptions = Prescription.objects.filter(
                doctor=doctor, prescribed_at__date__gte=from_date,
                prescribed_at__date__lte=today,
            )
            lab_requests = labRequest.objects.filter(
                doctor=doctor, created_at__date__gte=from_date,
                created_at__date__lte=today,
            )

        appointment_counts = {
            entry['appointment_date']: entry['count']
            for entry in appointments.values('appointment_date').annotate(count=Count('id'))
        }
        trends = [
            {
                'date': (from_date + timedelta(days=offset)).isoformat(),
                'count': appointment_counts.get(from_date + timedelta(days=offset), 0),
            }
            for offset in range(days)
        ]
        total_appointments = appointments.count()
        return Response({
            'status': 'success',
            'data': {
                'period': {
                    'from': from_date.isoformat(),
                    'to': today.isoformat(),
                    'days': days,
                },
                'summary': {
                    'total_appointments': total_appointments,
                    'patients': appointments.values('patient_id').distinct().count(),
                    'prescriptions': prescriptions.count(),
                    'lab_requests': lab_requests.count(),
                    'completion_rate': round(
                        appointments.filter(status='Completed').count() * 100 / total_appointments,
                        2,
                    ) if total_appointments else 0,
                },
                'status_breakdown': list(
                    appointments.values('status').annotate(count=Count('id'))
                ),
                'trends': trends,
            },
        }, status=status.HTTP_200_OK)

class PatientDetail(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request,bill_id):
        try:
            patient = Patient.objects.filter(id=bill_id).first()
            if patient is None:
                return Response(
                    {'status': 'empty', 'data': None},
                    status=status.HTTP_200_OK,
                )
            doctor = Doctor.objects.filter(user=request.user).first()
            if doctor is None:
                return Response(
                    {'status': 'empty', 'data': None},
                    status=status.HTTP_200_OK,
                )
            
            has_appointment = Appointment.objects.filter(doctor=doctor,patient=patient).exists()
            if not has_appointment:
                return Response({
                    'Message': 'You are not authorized for this patient'
                },status=status.HTTP_403_FORBIDDEN)
            
            appointments = Appointment.objects.filter(doctor=doctor,patient=patient).order_by('-appointment_date')
            prescriptions = Prescription.objects.filter(
                doctor=doctor, patient=patient
            ).order_by('-prescribed_at')
            lab_requests = labRequest.objects.filter(doctor=doctor,patient=patient).order_by('-created_at')
            appointment_serializer = AppointmentSerializer(appointments,many=True,context={'request':request})
            prescription_serializer = PrescriptionSerializer(prescriptions,many=True,context={'request':request})
            
            stats = {
                'total_visits': appointments.count(),
                'last_visit': appointments.first().appointment_date if appointments.exists() else None,
                'total_prescriptions': prescriptions.count(),
                'active_prescriptions': prescriptions.filter(is_active=True).count(),
                'pending_requests': lab_requests.filter(status='requested').count(),
            }
            return Response({
                'id': patient.id,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'gender': patient.gender,
                'age': patient.age,
                'phone': patient.phone,
                'email': patient.email,
                'address': patient.address,
                'statistics': stats,
                'appointments': appointment_serializer.data,
                'prescriptions': prescription_serializer.data,
            },status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'Error',
                'Message':'Doctor profile missing!'
            },status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({
                'status': 'Error',
                'Message': 'Patient profile missing!'
            },status=status.HTTP_404_NOT_FOUND)
        

class Reports(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        reports = Report.objects.none() if doctor is None else Report.objects.filter(
            doctor=doctor
        ).order_by('-created_at')
        return Response({
            'status': 'success',
            'data': ReportSerializer(reports, many=True, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

class Appointments(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]
    def get(self,request):
        doctor = request.user.doctor
        appointments = Appointment.objects.filter(doctor=doctor).order_by('-appointment_date')
        serializer = AppointmentSerializer(appointments,many=True)
        return Response({
            'data': serializer.data
        },status=status.HTTP_200_OK)

class SendReportToPatient(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def post(self,request,report_id):
        report = get_object_or_404(Report,pk=report_id)
        if report.is_sent_to_patient:
            return Response({
                'status': 'error',
                'Message': 'Report already sent to Patient'
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            context ={
                'patient_name': report.patient.first_name,
                'doctor': report.doctor.full_name,
                'report': report,
                'today':timezone.now().date(),
                'download_link':request.build_absolute_uri(reverse('secure_report_download',args=[report.access_token]))
            }
            pdf_bytes = generate_pdf('reports/report_pdf.html',context)
            if pdf_bytes is None:
                return Response({
                    'status': 'error',
                    'Message': 'PDF generation failed'
                })
            filename= f'report_{report_id}.pdf'
            report.pdf_file.save(filename,ContentFile(pdf_bytes))
            report.is_sent_to_patient = True
            report.sent_at = timezone.now()
            report.save()
            
            patient_email = report.patient.email
            subject = 'Medical Report from SmartCare General Hospital'
            body_html = render_to_string('email/report_sent.html',context)
            email = EmailMessage(subject, body_html, patient_email, to=[patient_email])
            email.content_subtype = "html"

            email.attach(filename,pdf_bytes,'application/pdf')
            try:
                email.send()
            except Exception as e:
                ReportAccessLog.objects.create(report=report,accessed_by=request.user,method=email,note=f"Send failed: {e}")
                messages.error(request,"Email Send failed; report saved but not mailed.")
                return redirect('doctor_view',report_id=report_id)

            ReportAccessLog.objects.create(report=report,accessed_by=request.user,method=email,note='Report sent to patient via email.')
            messages.success(request,'Report successfully sent to patient')
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Patient not found'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status':'error',
                'Message':str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LabRequests(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        lab_requests = labRequest.objects.none() if doctor is None else (
            labRequest.objects.filter(doctor=doctor)
            .select_related('patient')
            .order_by('-created_at')
        )
        status_filter = request.query_params.get('status')
        if status_filter:
            lab_requests = lab_requests.filter(status=status_filter)

        patient_id = request.query_params.get('patient')
        if patient_id:
            lab_requests = lab_requests.filter(patient_id=patient_id)
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
            page_size = min(max(int(request.query_params.get('page_size', 20)), 1), 100)
        except ValueError:
            page, page_size = 1, 20
        paginator = Paginator(lab_requests, page_size)
        current_page = paginator.get_page(page)
        serialized = LabRequestSerializer(
            current_page, many=True, context={'request': request}
        )
        return Response({
            'status': 'success',
            'data': {
                'lab_requests': serialized.data,
                'total': paginator.count,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_size': paginator.num_pages,
                },
            },
        }, status=status.HTTP_200_OK)
    def post(self,request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            patient_id = request.data.get('patient_id')
            test_type = request.data.get('test_type')
            test_name = request.data.get('test_name')
            notes = request.data.get(
                'notes', request.data.get('instructions', request.data.get('instruction', ''))
            )
            priority = request.data.get('priority','normal')
            
            if not patient_id:
                return Response({
                    'Message': 'Patient ID required'
                },status=status.HTTP_400_BAD_REQUEST)
            if not test_type:
                return Response({
                    'Message': 'Test type required'
                },status=status.HTTP_400_BAD_REQUEST)
            if test_type not in dict(labRequest.TEST_CHOICES):
                return Response({
                    'Message': 'Unsupported test type'
                },status=status.HTTP_400_BAD_REQUEST)
            if priority == 'stat':
                priority = 'urgent'
            if priority not in {'normal', 'urgent'}:
                return Response({
                    'Message': 'Priority must be normal or urgent'
                }, status=status.HTTP_400_BAD_REQUEST)
            patient = get_object_or_404(Patient,id=patient_id)
            if not Appointment.objects.filter(doctor=doctor, patient=patient).exists():
                return Response({
                    'Message': 'You do not have an appointment with this patient'
                }, status=status.HTTP_403_FORBIDDEN)
            
            lab_request = labRequest.objects.create(
                doctor=doctor,
                patient=patient,
                test_type=test_type,
                test_name=test_name,
                notes=notes,
                urgency=priority,
                status='requested',
            )
            serializer = LabRequestSerializer(lab_request,context={'request': request})
            return Response({
                'status': 'success',
                'Message': 'Lab request created successfully',
                'data': serializer.data
            },status=status.HTTP_201_CREATED)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Doctor profile missing!'
            },status=status.HTTP_404_NOT_FOUND)
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Patient profile missing!'
            },status=status.HTTP_404_NOT_FOUND)

class DoctorSearch(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor = Doctor.objects.filter(user=request.user).first()
        query = request.GET.get('q','')
        patient_id = request.GET.get('patient_id')
        if doctor is None:
            return Response({
                'status': 'success',
                'data': {'patients': [], 'appointments': [], 'lab_requests': [], 'reports': []},
            }, status=status.HTTP_200_OK)

        patients = Patient.objects.filter(appointments__doctor=doctor).distinct()
        if patient_id:
            patients = patients.filter(id=patient_id)
        if query:
            patients = patients.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query)
            )
        appointments = Appointment.objects.filter(doctor=doctor).select_related('patient')
        if query:
            appointments = appointments.filter(
                Q(patient__first_name__icontains=query)
                | Q(patient__last_name__icontains=query)
                | Q(purpose__icontains=query)
            )
        lab_requests = labRequest.objects.filter(doctor=doctor).select_related('patient')
        if query:
            lab_requests = lab_requests.filter(
                Q(test_type__icontains=query) | Q(test_name__icontains=query)
            )
        reports = Report.objects.filter(doctor=doctor).select_related('patient')
        if query:
            reports = reports.filter(
                Q(patient__first_name__icontains=query)
                | Q(patient__last_name__icontains=query)
            )
        return Response({
            'status': 'success',
            'data': {
                'patients': PatientSerializer(
                    patients, many=True, context={'request': request}
                ).data,
                'appointments': AppointmentSerializer(
                    appointments, many=True, context={'request': request}
                ).data,
                'lab_requests': LabRequestSerializer(
                    lab_requests, many=True, context={'request': request}
                ).data,
                'reports': ReportSerializer(
                    reports, many=True, context={'request': request}
                ).data,
            },
        }, status=status.HTTP_200_OK)