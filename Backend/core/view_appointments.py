import datetime
from django.shortcuts import get_object_or_404
from django.utils import timezone
from core.util.audit import log_activity
from core.util.trigger_emergency import trigger_emergency
from .models import Appointment,Doctor,Patient,AuditLog
from core.util.email_service import send_email
from .services.scheduling import generate_slots,validate_slot
from .services.emergency import Emergency
from core.models import Patient, Report, ReportAccessLog, Doctor, Appointment,AdminAnnouncement
from Hospital.Api.serializers import AppointmentSerializer,ReportSerializer,PatientSerializer,DoctorSerializer,AuditLogSerializer
from Hospital.Api.permissions import IsAdmin,IsDoctor,IsPatient,CreateEmergency
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db import transaction
from django.core.paginator import Paginator,Page
from system.utils import get_system_settings

class BookAppointment(APIView):
    permission_classes = [AllowAny]
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
    
    def get(self,request):
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

class EmergencyAppointment(APIView):
    permission_classes = [IsAuthenticated,CreateEmergency]
    def get(self,request):
        
        doctor_id = request.data.get('doctor')
        reason = request.data.get('emergency_reason','Emergency case')
        
        if not doctor_id:
            return Response({
                'error': 'Doctor is required'
            },status=status.HTTP_400_BAD_REQUEST)
        doctor = get_object_or_404(Doctor, id=doctor_id)
        
        if request.user.user_type == 'patient':
            patient = request.user.patientprofile
        else:
            patient_id = request.data.get('patient')
            if not patient_id:
                return Response({
                    'error': 'Patient is required!'
                },status=status.HTTP_400_BAD_REQUEST)
            patient = get_object_or_404(Patient,id=patient_id)
        
        now = timezone.now()
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            appointment_date=now.date(),
            appointment_time=now.time(),
            duration=get_system_settings().appointment_duration,
            status='Emergency',
            priority='Critical',
            created_by=qrequest.user
        )
        
        return Response({
            'Message': 'Emergency appointment created successfully',
            'Appointment': AppointmentSerializer(appointment).data
        },status=status.HTTP_201_CREATED)


class AppointmentList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        try: 
            appointments = Appointment.objects.select_related('doctor__user','patient').all().order_by('-appointment_date','-appointment_time')
            if request.user.user_type == 'patient':
                try:
                    patient = Patient.objects.get(user=request.user)
                    appointments = appointments.filter(patient=patient)
                except Patient.DoesNotExist:
                    appointments = appointments.none()
            elif request.user.user_type == 'doctor':
                try:
                    doctor = Doctor.objects.get(user=request.user)
                    appointments = appointments.filter(doctor=doctor)
                except Doctor.DoesNotExist:
                    appointments = appointments.none()
                    
            doctor_id = request.query_params.get('doctor_id')
            if doctor_id:
                appointments = appointments.filter(doctor_id=doctor_id)
                
            patient_id = request.query_params.get('patient_id')
            if patient_id:
                appointments = appointments.filter(patient_id=patient_id)
            
            date = request.query_params.get('date')
            if date:
                try:
                    date_obj = datetime.strptime(date,'%Y-%m-%d').date()
                    appointments = appointments.filter(appointment_date=date_obj)
                except ValueError:
                    pass
                
            status_filter = request.query_params.get('status')
            if status_filter:
                appointments = appointments.filter(status=status_filter)
                
            page = int(request.query_params.get('page',1))
            page_size = int(request.query_params.get('page_size',20))
            paginator = Paginator(appointments,page_size)
            current_page = paginator.get_page(page)
            
            serializer = AppointmentSerializer(current_page,many=True,context={'request':request})
            return Response({
                'status': 'success',
                'data':{
                    'appointments': serializer.data,
                    'total': paginator.count,
                    'page': page,
                    'page_size': page_size,
                    'total_pages': paginator.num_pages,
                }
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class RescheduleAppointment(APIView):
    permission_classes = [IsAuthenticated]
    def put(self,request,appointment_id):
        appointment = get_object_or_404(Appointment.objects.select_related('doctor','patient'),id=appointment_id)
        if not self.can_reschedule(request.user,appointment):
            return Response({
                'status': 'error',
                'Message': 'You are not authorized to reschedule this appointment!'
            },status=status.HTTP_403_FORBIDDEN)
        
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            new_date = serializer.validated_data['new_date']
            new_time = serializer.validated_data['new_time']
            reason = serializer.validated_data.get('reason','Rescheduling')
            
            is_availabe,error = slot_is_available(appointment.doctor, new_date, new_time, appointment.patient)
            if not is_availabe:
                return Response({
                    'status': 'error',
                    'Message': error or 'Selected time slot is not available. Try another slot!'
                },status=status.HTTP_400_BAD_REQUEST)
            appointment.appointment_date = new_date
            appointment.appointment_time = new_time
            appointment.status = 'Rescheduled'
            appointment.reschedule_count += 1
            appointment.save()
            
            self.log_reschedule(appointment,request.user,old_date)
            return Response({
                'status': 'success',
                'Message': 'Appointment rescheduled successfully',
                'data':{
                    'appointment': AppointmentSerializer(appointment,context={'request':request}).data,
                    'new_date': new_date.isoformat(),
                    'new_time': new_time.strftime('%H:%M'),
                    'status': appointment.status
                }
            },status=status.HTTP_200_OK)
        return Response({
            'status': 'error',
            'Message': serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)