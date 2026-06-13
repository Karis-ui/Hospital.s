from core.models import Bill, Appointment, Report, Patient,Doctor,Prescription
from Lab.models import labRequest,LabReport
from django.shortcuts import get_object_or_404
from django.utils import timezone
from fontTools.ttLib.tables.ttProgram import instructions
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Hospital.Api.serializers import (
    PatientSerializer,AppointmentSerializer,DoctorSerializer,BillSerializer,LabReportSerializer,LabRequestSerializer,ReportSerializer
)
from Hospital.Api.permissions import IsPatient,IsDoctor
from Hospital import settings

class Patientdashboard(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        try:
            patient = Patient.objects.select_related('user').get(user=request.user)
            patient_profile = get_object_or_404(Patient,user=request.user)
            completed= Appointment.objects.filter(patient=patient_profile,status='Completed')
            upcoming = Appointment.objects.filter(patient=patient_profile,status='Requested')
            bills = Bill.objects.filter(patient=patient_profile)
            lab_reports = LabReport.objects.filter(patient=patient_profile)
            return Response({
                'patient':PatientSerializer(patient_profile).data,
                'completed_appointments':AppointmentSerializer(completed,many=True).data,
                'upcoming_appointments':AppointmentSerializer(upcoming,many=True).data,
                'bills':BillSerializer(bills,many=True).data,
                'lab_reports':LabReportSerializer(lab_reports,many=True).data
            },status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Patient profile missing'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             

class BookAppointment(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def post(self,request):
        try:
            required_fields = ['doctor_id','appointment_date','appoitment_time']
            for field in required_fields:
                if field not in request.data:
                    return Response({
                        'status': 'error',
                        'Message': f'{field} is required',
                    },status=status.HTTP_400_BAD_REQUEST)
            doctor_id = request.data.get('doctor_id')
            patient_data = request.data.get('patient',{})
            appointment_date = request.data.get('appointment_date')
            appointment_time = request.data.get('appointment_time')
            purpose = request.data.get('purpose','')
            
            doctor = get_object_or_404(Doctor, id=doctor_id)
            patient = None
            if request.user.is_authenticated and request.user.user_type == 'patient':
                try:
                    patient = Patient.objects.get(user=request.user)
                except Patient.DoesNotExist:
                    pass
            if not patient and patient_data.get('email'):
                try:
                    patient = Patient.objects.get(email=patient_data['email'])
                except Patient.DoesNotExist:
                    with transaction.atomic():
                        user = User.objects.create_user(
                            username = patient_data['email'],
                            email=patient_data['email'],
                            password=patient_data.get('password',User.objects.make_random_password()),
                            first_name = patient_data.get['first_name'],
                            last_name = patient_data.get['last_name']
                        )
                        user.user_type = 'patient'
                        user.save()
                            
                        patient = Patient.objects.create(
                            user=user,
                            first_name = patiet_data.get('first_name',''),
                            last_name=patient_data.get('last_name',''),
                            email=patient_data['email'],
                            phone=patient_data.get('phone',''),
                            age=patient_data.get('age',''),
                            gender=patient_data.get('gender','')
                        )
            if not patient:
                return Response({
                    'status': 'error',
                    'Message': 'Patient Info missing!'
                },status=status.HTTP_400_BAD_REQUEST)
                
            try:
                app_date = datetime.strptime(appointment_date,'%Y-%m-%d').date()
                app_time = datetime.strptime(appointment_time,'%H:%M').time()
            except ValueError:
                return Response({
                    'status': 'error',
                    'Message': 'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time'
                },status=status.HTTP_400_BAD_REQUEST)
                    
            if not is_valid:
                return Response({
                    'status': 'error',
                    'Message': 'Selected time slot is not available'
                },status=status.HTTP_400_BAD_REQUEST)
                
            settings = get_system_settings()
            duration = settings.appointment_duration if settings else 30
            appointment = Appointment.objects.create(
                doctor=doctor,
                patient=patient,
                appointment_date=app_date,
                appointment_time=app_time,
                duration=duration,
                purpose=purpose,
                status='requested',
                created_at=timezone.now(),
                created_by=request.user if request.user.is_authenticated else None
            )
            
            serializer = AppointmentSerializer(appointment,context={'request':request})
            return Response({
                'status': 'success',
                'Message': 'Appointment booked successfully',
                'data':{
                    'appointment': serializer.data,
                    'appointment_id': appointment.id,
                    'message': f'Appointment with DR. {doctor.user.get_full_name()} on {app_date} at {app_time} has been requested.'
                }
            },status=status.HTTP_201_CREATED)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'error',
                'Message': 'Doctor not found. Try again!'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_available_slots(self,doctor,date):
        start_hour = 8
        end_hour = 17
        slot_duration= 30
        
        booked_slots = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            status__in=['Requested','Scheduled']
        ).values_list('time',flat=True)
        
        availabe_slots = []
        current_time = datetime.strptime(f'{start_hour}:00', '%H:%M').time()
        end_time = datetime.strptime(f'{end_hour}:00','%H:%M').time()
        
        while current_time < end_time:
            if current_time not in booked_slots:
                availabe_slots.append(current_time.strptime("%H:%M"))
                
            current_time = (datetime.combine(date,current_time)) + timezone.timedelta(minutes=slot_duration).time()
        return availabe_slots
    
    def get_doctors(self,request):
        try:
            doctor_id = request.query_params.get('doctor_id')
            date = request.query_params.get('date',timezone.now().date().isoformat())
            doctors = Doctor.objects.select_related('user').filter(user__is_approved=True)
            
            if doctor_id:
                doctors = doctors.filter(id=doctor_id)
            try:
                selected_date = datetime.strptime(date,'%Y-%m-%d').date()
            except ValueError:
                selected_date = timezone.now().date()
            
            doctor_data = []
            for doctor in doctor_data:
                availabel_slots = self.get_available_slots(doctor,selected_date)
                doctor_data.append({
                    'id': doctor.id,
                    'name': doctor.user.get_full_name(),
                    'specialization': doctor.speciality,
                    'available_slots': availabel_slots,
                    'consultation_fee': doctor.consultation_fee,
                    'image': doctor.user.profile_image.url if hasattr(doctor.user,'profile_image') and doctor.user.profile_image else None
                })
            return Response({
                'status': 'success',
                'data':{
                    'date': selected_date.isoformat(),
                    'doctor': doctor_data,
                    'total_doctors': len(doctor_data)
                }
            },status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class  CancelAppointment(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self,request,pk):
        appointment = get_object_or_404(Appointment,id=pk)
        if request.user not in [appointment.doctor.user,appointment.patient.user] and not request.user.is_staff:
            return Response({
                {'error': 'You are not authorized to view this page!'}
            },status=status.HTTP_403_FORBIDDEN)
        
        if appointment.status == "Cancelled":
            return Response({
                'message': 'Appointment already cancelled'
            },status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('Reason','No reason provided.')
        
        appointment.status = "Cancelled"
        appointment.save()
        return Response({
            'messages': 'Appointment cancelled succefully','status': appointment.status
        },status=status.HTTP_200_OK)

class  ConfirmAppointment(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,pk):
        appointment = get_object_or_404(Appointment,id=pk)
        if request.user not in [appointment.patient.user] and not request.user.is_staff:
            return Response({
                {'error': 'You are not authorized to view this page!'}
            },status=status.HTTP_403_FORBIDDEN)
        
        if appointment.status == "Confirmed":
            return Response({
                'message': 'Appointment already confirmed'
            },status=status.HTTP_200_OK)
        
        appointment.status = "Confirmed"
        appointment.save()
        return Response({
            'messages': 'Appointment cancelled succefully','status': appointment.status
        },status=status.HTTP_200_OK)

class AppointmentList(APIView):
    permission_classes = [IsAuthenticated, IsPatient]
    def get(self,request):
        patient = request.user.patient
        appointments = Appointment.object.filter(patient=patient).order_by('-appointment_date')
        serializer = AppointmentSerializer(appointments,many=True)
        return Response({
            'data': serializer.data
        },status=status.HTTP_200_OK)
        
class DetailAppointmentView(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request,patient_id):
        doctor = request.user.doctor_profile
        appointments = Appointment.objects.filter(
            patient_id=patient_id, doctor=doctor
        ).order_by('-appointment_date')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

class LabViews(APIView):
    permission_classes = [IsAuthenticated,IsDoctor]
    def get(self,request,patient_id):
        doctor = request.user.doctor_profile
        lab_views = labRequest.objects.filter(
            patient_id=patient_id, doctor=doctor
        ).order_by('-appointment_date')
        serializer = LabRequestSerializer(lab_views, many=True)
        return Response(serializer.data)

class BillingView(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        patient = get_object_or_404(Patient,user=request.user)
        bills = Bill.objects.filter(patient=patient).all
        return Response(BillSerializer(bills,many=True).data,status=status.HTTP_200_OK)

class GetProfile(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        patient_profile = get_object_or_404(Patient, user=request.user)
        serializer = PatientSerializer(patient_profile)
        return Response(serializer.data)

class UpdateProfile(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def put(self,request):
        patient_profile = get_object_or_404(Patient, user=request.user)
        serializer = PatientSerializer(
            patient_profile,data=request.data,partial=True,context={'request':request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message':'Profile updated successfully',
                'patient':serializer.data
            })
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def post(self,request):
        patient_profile = get_object_or_404(Patient,user=request.user)
        if 'patient_photo' in request.FILES:
            photo = request.FILES['patient_photo']
            allowed_extensions = ['jpg','jpeg','png','gif','webp']
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
                old_photo_path = os.path.join(settings.MEDIA_ROOT,str(patient_profile.patient_photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
                    
            patient_profile.doctor_photo = photo
            patient_profile.save()
            
            if (serializer.is_valid()):
                serializer.save()
            return Response({
                'message':'Profile updated successfully',
                'patient':serializer.data
            })
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        patient_profile = get_object_or_404(Patient, user=request.user)
        
        if not patient_profile.doctor_profile:
            return Response({
                'error': 'No profile photo to delete'
            }, status=status.HTTP_404_NOT_FOUND)
        
        photo_path = os.path.join(settings.MEDIA_ROOT, str(doctor_profile.patient_photo))
        if os.path.exists(photo_path):
            os.remove(photo_path)
        
        patient_profile.patient_photo = None
        patient_profile.save()
        
        return Response({
            'message': 'Profile photo deleted successfully'
        }, status=status.HTTP_200_OK)

class DownloadReport(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request,report_id):
        patient = get_object_or_404(Patient,user=request.user)
        report = get_object_or_404(Report,id=report_id)
        reports = Report.objects.filter(patient=patient,is_sent_to_patient=True).select_related('doctor').order_by('-created_at')
        
        if report.patient.user != request.user:
            return Response({'error': "You don't have permission to access this report."},status=status.HTTP_403_FORBIDDEN)

        if not report.is_sent_to_patient:
            return Response({'error': "Report not yet Available."},status=status.HTTP_403_FORBIDDEN)
        
        if not report.pdf_file:
            return Response({
                'Error': 'Report file missing'
            },status=status.HTTP_404_NOT_FOUND)
        filename = f'Report_{report.patient.id}_{report.created_at.date()}.pdf'
        
        try:
            response = Response(report.pdf_file.read(),content_type='application/pdf')
            response['Content-Disposition'] - f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({
                'Error': f'Error reading file: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        serializer = ReportSerializer(reports,many=True,context={'request':request})
        return Response({
            'status': 'success','count': reports.count(),'data': serializer.data
        },status=status.HTTP_200_OK)
            
class EditAppointment(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def put(self,request,appointment_id):
        appointment = get_object_or_404(Appointment,id=appointment_id)
        
        if appointment.patient.user != request.user:
            return Response({
                'error': 'Unauthorized access to this appointment page'
            },status=status.HTTP_403_FORBIDDEN)
        serializer = AppointmentSerializer(appointment,data=request.data,partial=True,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class LabResult(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        try:
            patient = get_object_or_404(Patient,user=request.user)
            results = LabReport.objects.filter(
                lab_request__patient = patient,
                is_approved=True
            ).select_related('lab_request__doctor__user').order_by('-uploaded_at')
        
            data = []
            for report in results:
                data.append({
                    'id': report.id,
                    'test_type': report.lab_request.test_type,
                    'doctor': report.lab_request.doctor.user.get_full_name() if report.lab_request.doctor else 'N/A',
                    'uploaded_at': report.uploaded_at,
                    'remarks': report.remarks,
                    'file_url': report.report_file.url if report.report_file else None,
                    'status': 'Available' if report.is_approved else 'Pending'
                })
                
            if not report.pdf_file:
                raise Http404('Report file missing.')
            return FileResponse(
                report.pdf_file.open("rb"),
                content_type = "application/pdf",
                as_attachment = True,
                filename = f'Labreport_{report.id}.pdf'
            )
            
            return Response({
                'counts': len(data),
            },
                data=data,status=status.HTTP_200_OK
            )
        except Patient.DoesNotExist:
            return Response({
                'error':'Patient profile not found'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error':str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

class Notification(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        notification = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notification,many=True,context={'request',request})

class AppointmentSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        status = request.GET.get('status', '')
        date_from = request.GET.get('from', '')
        date_to = request.GET.get('to', '')
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)
        
        appointments = Appointment.objects.filter(patient=patient)
        
        if query:
            appointments = appointments.filter(
                Q(doctor__user__full_name__icontains=query) |
                Q(purpose__icontains=query) |
                Q(doctor__speciality__icontains=query)
            )
        if status:
            appointments = appointments.filter(status=status)
        
        if date_from:
            appointments = appointments.filter(appointment_date__gte=date_from)
        if date_to:
            appointments = appointments.filter(appointment_date__lte=date_to)
        
        appointments = appointments.order_by('-appointment_date', '-appointment_time')
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = appointments[start:end]
        
        stats = {
            'total': appointments.count(),
            'completed': appointments.filter(status='Completed').count(),
            'upcoming': appointments.filter(
                status__in=['Scheduled', 'Confirmed'],
                appointment_date__gte=timezone.now().date()
            ).count(),
        }
        
        serializer = AppointmentSerializer(paginated, many=True)
        
        return Response({
            'query': query,
            'filters': {
                'status': status,
                'date_from': date_from,
                'date_to': date_to
            },
            'statistics': stats,
            'results': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': (appointments.count() + page_size - 1),
                'total_items': appointments.count()
            }
        })
        
class PatientInvoice(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request,bill_id):
        patient = request.user.patient
        bill = get_object_or_404(Bill,id=bill_id,patient=patient)
        pdf = generate_invoice_pdf(bill)
        response = HttpResponse(pdf,content_type="application/pdf")
        response["Contect Disposition"] = (f'attachment; filename="invoice_{bill_id}.pdf"')
        return response


class PrescriptionSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        active_only = request.GET.get('active', '').lower() == 'true'
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)
        
        prescriptions = Prescription.objects.filter(patient=patient)
        
        if query:
            prescriptions = prescriptions.filter(
                Q(medication__icontains=query) |
                Q(doctor__user__full_name__icontains=query) |
                Q(instructions__icontains=query)
            )
        
        if active_only:
            prescriptions = prescriptions.filter(
                status='active',
                end_date__gte=timezone.now().date()
            )
        
        prescriptions = prescriptions.order_by('-prescribed_at')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = prescriptions[start:end]
        
        serializer = PrescriptionSerializer(paginated, many=True)
        
        return Response({
            'query': query,
            'active_only': active_only,
            'total': prescriptions.count(),
            'active_count': prescriptions.filter(status='active').count(),
            'results': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': (prescriptions.count() + page_size - 1) // page_size
            }
        })


class BillSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        status = request.GET.get('status', '')
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)
        
        bills = Bill.objects.filter(patient=patient)
        
        if query:
            bills = bills.filter(
                Q(bill_number__icontains=query) |
                Q(description__icontains=query) |
                Q(doctor__user__full_name__icontains=query) 
            )
        
        if status:
            bills = bills.filter(payment_status=status)
        
        bills = bills.order_by('-created_at')
        
        total_amount = bills.aggregate(total=models.Sum('amount'))['total'] or 0
        pending_amount = bills.filter(payment_status='Pending').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = bills[start:end]
        
        serializer = BillSerializer(paginated, many=True)
        
        return Response({
            'query': query,
            'status': status,
            'total_bills': bills.count(),
            'total_amount': total_amount,
            'pending_amount': pending_amount,
            'results': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': (bills.count() + page_size - 1) 
            }
        })


class LabResultSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        critical_only = request.GET.get('critical', '').lower() == 'true'
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)
        
        lab_reports = LabReport.objects.filter(
            lab_request__patient=patient
        ).select_related('lab_request__doctor__user')
        if query:
            lab_reports = lab_reports.filter(
                Q(lab_request__test_name__icontains=query) |
                Q(lab_request__doctor__user__full_name__icontains=query) |
                Q(remarks__icontains=query)
            )
        
        if critical_only:
            lab_reports = lab_reports.filter(is_critical=True)
        
        lab_reports = lab_reports.order_by('-uploaded_at')
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = lab_reports[start:end]
        
        serializer = LabReportSerializer(paginated, many=True)
        
        return Response({
            'query': query,
            'critical_only': critical_only,
            'total': lab_reports.count(),
            'critical_count': lab_reports.filter(is_critical=True).count(),
            'results': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': (lab_reports.count() + page_size - 1) // page_size
            }
        })


class DoctorSearchView(APIView):
    permission_classes = []
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        speciality = request.GET.get('speciality', '')
        
        doctors = Doctor.objects.filter(user__is_approved=True)
        
        if query:
            doctors = doctors.filter(
                Q(user__full_name__icontains=query) |
                Q(speciality__icontains=query) |
                Q(department__icontains=query) |
                Q(qualifications__icontains=query)
            )
        if speciality:
            doctors = doctors.filter(speciality__icontains=speciality)
        
        doctors = doctors.order_by('user__full_name')
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = doctors[start:end]
        
        doctor_data = []
        for doctor in paginated:
            doctor_data.append({
                'id': doctor.id,
                'name': doctor.user.get_full_name(),
                'specialization': doctor.speciality,
                'qualifications': doctor.qualifications,
                'languages': getattr(doctor, 'languages', ''),
                'available': getattr(doctor, 'is_available', True),
            })
        
        return Response({
            'query': query,
            'filters': {
                'speciality': speciality,
                'language': language
            },
            'total': doctors.count(),
            'results': doctor_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': (doctors.count() + page_size - 1) // page_size
            }
        })


class SearchSuggestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'suggestions': []})
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)
        
        suggestions = []
        
        doctors = Doctor.objects.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(speciality__icontains=query)
        ).filter(
            user__is_approved=True
        )[:3]
        
        for doctor in doctors:
            suggestions.append({
                'type': 'doctor',
                'text': f"Dr. {doctor.user.get_full_name()} - {doctor.speciality}",
                'id': doctor.id
            })
        medications = Prescription.objects.filter(
            patient=patient,
            medication__icontains=query
        ).values_list('medication', flat=True).distinct()[:3]
        
        for med in medications:
            suggestions.append({
                'type': 'medication',
                'text': med,
                'search': med
            })
        
        tests = LabReport.objects.filter(
            lab_request__patient=patient,
            lab_request__test_name__icontains=query
        ).values_list('lab_request__test_name', flat=True).distinct()[:3]
        
        for test in tests:
            suggestions.append({
                'type': 'test',
                'text': test,
                'search': test
            })
        
        return Response({
            'query': query,
            'suggestions': suggestions
        })
        
class PaymentHistory(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self, request):
        patient = request.user.patient
        payments = Bill.objects.filter(patient=patient,payment_status="Cleared").order_by("-date")
        serializer = BillSerializer(payments,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)