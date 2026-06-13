from audioop import reverse
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
from core.util.email_service import send_email
from django.core.paginator import Paginator
from reportlab.lib import colors
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Hospital.Api.permissions import IsDoctor
from Hospital.Api.serializers import  DoctorSerializer,LabReportSerializer,LabRequestSerializer,PatientSerializer,AppointmentSerializer,PrescriptionSerializer
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
            doc = SimpleDocTemplate(response,pagesize=A4)
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
    def get(self,request,report_id):
        report = get_object_or_404(Report,id=report_id)
        if report.doctor.user != request.user:
            return Response({
                'status': 'error',
                'Message': 'Not Authorized'
            },status=status.HTTP_401_UNAUTHORIZED)
            
class DoctorDashboard(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,rquest):
        try:
            doctor = Doctor.objects.select_related('user').get(user=request.user)
            if not request.user.is_approved:
                return Response({
                    'status': 'pending',
                    'message': 'Your account is pending approval',
                    'data': {
                        'is_approved': False,
                        'specialization': doctor.speciality,
                        'department': doctor.department
                    }
                },status=status.HTTP_200_OK)
                
            today_appointments = Appointment.objects.filter(created_at=datetime.today())
            complete_today = Appointment.objects.filte(doctor=doctor,appointment_date=datetime.today(),status='Completed') 
            waiting = Appointment.objects.filter(appointment_date=datetime.today(),status='Requested')
            total_patients = Patient.objects.filter(doctor=doctor).values('patient').distinct().count()
            cancelled = Appointment.objects.filter(doctor=doctor,status='cancelled')
            patient_list = Patient.objects.filter(id__in=recent_patients)
            pending_prescriptions = Prescription.objects.filter(doctor=doctor,status='pending').count()
            week_days =[]
            appointment_counts = []
            for i in range(7):
                day = datetime.today() - timedelta(days=6-i)
                count = Appointment.objects.filter(
                    doctor=doctor,appointment_date=datetime.today()
                ).count()
                week_days.append(day.strftime('%a'))
                appointment_counts.append(count)
                
            today_serializer = AppointmentSerializer(today_appointments,many=True,context={'request':request})
            upcoming_serializer = AppointmentSerializer(waiting,many=True,context={'request':request})
            patient_serializer = PatientSerializer(patient_list,many=True,context={'request':request})
            doctor_serializer = DoctorSerializer(doctor,many=True,context={'request':request})
            return Response({
                'status': 'success',
                'data': {
                    'doctor': doctor_serializer.data,
                    'is_approved': request.user.is_approved,
                    'statistics': {
                        'total_patients': total_patients,
                        'total_appointments': total_appointments,
                        'completed_appointments': completed_appointments,
                        'cancelled_appointments': cancelled_appointments,
                        'pending_prescriptions': pending_prescriptions,
                        'pending_lab_requests': pending_lab_requests,
                        'today_appointments_count': today_appointments.count(),
                    },
                    'appointments': {
                        'today': today_serializer.data,
                        'upcoming': upcoming_serializer.data,
                    },
                    'recent_patients': patients_serializer.data,
                    'chart_data': {
                        'labels': week_days,
                        'values': appointment_counts
                    },
                    'current_time': timezone.now().isoformat(),
                }
            }, status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'Error','message': 'Doctor profile missing!'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetDoctorProfile(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor_profile = get_object_or_404(Doctor, user=request.user)
        serializer = DoctorSerializer(doctor_profile)
        return Response(serializer.data)

class UpdateDoctorProfile(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
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
            allowed_extensions = ['jpg','jpeg','png','webp']
            file_extension = photo.name.split('.')[-1].lower()
            
            if file_extension not in allowed_extension:
                return Response({
                    'error': f'file type not allowed. Try {", ".join(allowed_extension)}'
                },status = status.HTTP_400_BAD_REQUEST)
            max_size = 5 * 1024 * 1024
            if photo.size > max_size:
                return Response({
                    'error': f'File too large. Max size: {max_size}MB'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if doctor_profile.doctor_photo:
                old_photo_path = os.path.join(settings.MEDIA_ROOT,str(doctor_profile.doctor_photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
                    
            doctor_profile.doctor_photo = photo
            doctor_profile.save()
            
            serializer = DoctorSerializer(doctor_profile,context={'request':request})
            if serializer.is_valid():
                serializer.save()
            return Response({
                'message':'Profile updated successfully',
                'data':serializer.data
            })
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
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
    
    @action(detail=True,methods=['put'],url_path='confirmed')
    def confirm_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status == 'confirmed'
        appointment.save()
        return Response({'message': 'Appointment confirmed'})
    
    @action(detail=True,methods=['put'],url_path='complete')
    def complete_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status == 'completed'
        appointment.save()
        return Response({'message': 'Appointment completed'})
    
    @action(detail=True,methods=['put'],url_path='cancel')
    def cancel_appointment(self,request,pk):
        appointment = get_object_or_404(Appointment,appointment_id=pk)
        appointment.status == 'cancelled'
        appointment.save()
        return Response({'message': 'Appointment cancelled'})

class MyPatients(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor_profile = Doctor.objects.filter(user=request.user).first()
        appointments = Appointment.objects.filter(doctor__user=request.user,status='Completed')
        patient_id = appointments.values_list('patient_id',flat=True).distinct()
        patients = Patient.objects.filter(id__in=patient_id)
        
        return Response({
            'status': 'success',
            'data': {
                'doctor_profile': doctor_profile,
                'appointments': appointments,
                'patients': patients,
            }
        },status=status.HTTP_200_OK)

class PrescriptionView(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        doctor_profile = Doctor.objects.filter(user=request.user).first()
        prescriptions = Prescription.objects.filter(doctor__user=request.user)
        patients = Prescription.objects.filter(id__in=patient_id)
        
        return Response({
            'status': 'success',
            'data': {
                'doctor_profile': doctor_profile,
                'prescriptions': prescriptions,
                'patients': patients,
            }
        },status=status.HTTP_200_OK)

class DoctorStatistics(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            period = request.query_params.get('peroid','month')
            today = timezone.now().date()
            
            if period == 'week':
                start_date = today - timedelta(days=7)
            elif period == 'month':
                start_date = today - timedelta(days=30)
            elif period == 'year':
                start_date = today - timedelta(days=365)
            else:
                start_date = today - timedelta(days=30)
                
            appointments = Appointment.objects.filter(doctor=doctor,appointment_date__gte=start_date)
            patients = appointments.values('patient').distinct().count()
            status_breakdown = appointments.values('status').annotate(count=Count('id'))
            
            trends = []
            while start_date <= today:
                count = appointments.filter(appointment_date=start_date).count()
                trends.append({
                    'date': start_date.isoformat(), 'count': count
                })
                start_date += timedelta(days=1)
                
                prescription = Prescription.objects.filter(doctor=doctor,prescribed_at__gte=start_date).count()
                lab_requests = labRequest.objects.filter(doctor=doctor,created_at__gte=start_date).count()
                
                return Response({
                    'status': 'success',
                    'data': {
                        'period': {
                            'from': start_date.isoformat(),
                            'to': today.isoformat(),
                            'days': (today-start_date).days + 1
                        },
                        'summary': {
                            'total_appointments': appointments.count(),
                            'patients': patients,
                            'prescriptions': prescription,
                            'lab_requests': lab_requests,
                            'completion_rate': round(
                                (appointments.filter(status='completed').count())
                                if appointments.count() > 0 else 0,2
                            )
                        },
                        'status_breakdown': list(status_breakdown),
                        'trends': trends,
                    }
                },status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({
                'Message': 'Doctor profile missing!'
            },status=status.HTTP_404_NOT_FOUND)

class PatientDetail(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request,patient_id):
        try:
            patient = get_object_or_404(Patient,id=patient_id)
            doctor = Doctor.objects.get(user=request.user)
            
            has_appointment = Appointment.objects.filter(doctor=doctor,patient=patient).exists()
            if not has_appointment:
                return Response({
                    'Message': 'You are not authorized for this patient'
                },status=status.HTTP_403_FORBIDDEN)
            
            appointments = Appointment.objects.filter(doctor=doctor,patient=patient).order_by('-appointment_date')
            prescriptions = Prescription.objects.filter(doctor=doctor,patient=patient).order_by('-created_at')
            lab_requests = labRequest.objects.filter(doctor=doctor,patient=patient).order_by('-created_at')
            appointment_serializer = AppointmentSerializer(appointments,many=True,context={'request':request})
            prescription_serializer = PrescriptionSerializer(prescriptions,many=True,context={'request':request})
            
            stats = {
                'total_visits': appointments.count(),
                'last_visit': appointments.first().appointment_date if appointments.exists else None,
                'total_prescriptions': prescriptions.count(),
                'active_prescriptions': prescriptions.filter(is_active=True).count(),
                'pending_requests': lab_requests.filter(status='requested').count(),
            }
            return Response({
                'data':{
                    'patient':{
                        'id': patient_id,
                        'first_name': patient.first_name,
                        'last_name': patient.last_name,
                        'gender': patient.gender,
                        'age': patient.age,
                        'phone': patient.phone,
                        'email': patient.email,
                        'address': patient.address,
                    },
                    'statistics': stats,
                    'appointments': appointment_serializer.data,
                    'prescriptions': prescription_serializer.data,
                }
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
        try:
            doctor = Doctor.objects.filter(user=request.user)
            pending_reports = Report.object.filter(doctor=doctor,is_sent_to_patient=False)
            sent_reports = Report.object.filter(doctor=doctor,is_sent_to_patient=True)
            context = {
                'doctor':doctor,'pending_reports':pending_reports,'sent_reports':sent_reports
            }
            return Response({
                'statys': 'success',
                'Message': 'Fetched successfully'
            },status=status.HTTP_200_OK)
        except Report.DoesNotExist:
            return Response({
                'statys': 'error',
                'Message': 'Report missing'
            },status=status.HTTP_404_NOT_FOUND)

class Appointments(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]
    def get(self,request):
        doctor = request.user.doctor
        appointments = Appointment.object.filter(doctor=doctor).order_by('-appointment_date')
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
        try:
            doctor = Doctor.objects.get(user=request.user)
            lab_requsets = labRequest.objects.filter(doctor=doctor).select_related('patient').order_by('-created_at')
            
            status_filter = request.quer_params.get('status')
            if status_filter:
                lab_requsets = lab_requsets.filter(status=status_filter)
            
            patient = request.quer_params.get('patient')
            if status_filter:
                patient = lab_requsets.filter(patient=patient)
            page = int(request.quer_params.get('page',1))
            page_size = int(request.query_params.get('page_size',20))  
            
            paginator = Pagiinator(lab_requsets,page_size)
            current_page = paginator.get_page(page)
            
            serializers = LabRequestSerializer(current_page,many=True,context={'request':request})
            return Response({
                'status': 'success',
                'data': {
                    'lab_requests': serializers.data,
                    'total': paginator.count,
                    'pagination':{
                        'current_page': page,
                        'page_size': page_size,
                        'total_size': paginator.num_pages,
                    }
                }
            },status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'success',
                'Message': 'Doctor profile missing!'
            },status=status.HTTP_404_NOT_FOUND)
    def post(self,request):
        try:
            doctor = Doctor.objects.get(user=rquest.user)
            patient_id = request.data.get('patient_id')
            test_type = request.data.get('test_type')
            notes = request.data.get('instruction','')
            priority = request.data.get('priority','normal')
            
            if not patient_id:
                return Response({
                    'Message': 'Patient ID required'
                },status=status.HTTP_400_BAD_REQUEST)
            if not test_type:
                return Response({
                    'Message': 'Test type required'
                },status=status.HTTP_400_BAD_REQUEST)
            patient = get_object_or_404(Patient,id=patient_id)
            
            lab_request = labRequest.objects.create(
                doctor=doctor,
                patient=patient,
                test_type=test_type,
                notes=notes,
                urgency=priority,
                status='requested'
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
        doctor = request.user.doctor_profile
        query = request.GET.get('q','')
        patient_id = request.GET.get('patient_id')
        
        results = {}
        patients = Patient.objects.filter(appointments__doctor=doctor).distinct()
        if patient_id:
            patients = patients.filter(id=patient_id)
        
        for patient in patients:
            prescriptions = Prescription.objects.filter(patient=patient,doctor=doctor).filter(
                Q(medication__icontains=query)|
                Q(instructions__icontains=query)
            )
            lab_requests = labRequest.objects.filter(patient=patient, doctor=doctor).filter(
                Q(test_name__icontains=query)|
                Q(instructions__icontains=query)
            )
            
            if prescriptions.exists() or lab_requests.exists():
                results[f'patient_{patient.id}'] = {
                    'patient_name': patient.first_name,
                    'prescriptions': PrescrptionSerializer(prescriptions,many=True).data,
                    'lab_request': LabRequestSerializer(lab_requests,many=True).data
                }
            return Response({
                'query': query, 'total_patients': len(results), 'results': results
            })