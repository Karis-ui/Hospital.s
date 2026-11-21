from rest_framework.decorators import throttle_classes
from re import match
import secrets
import logging
import smtplib
from rest_framework.parsers import MultiPartParser, FormParser
import string
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
import random,string
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from .serializers import (
    SignUp,
    LoginSerializer,
    ForgotPassword as ForgotPasswordSerializer,
    ResetPassword as ResetPasswordSerializer,
    ChangePasswordSerializer,
    UserProfile,
)
from Hospital.Api.serializers import UserSerializer,HospitalAdminSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from core.models import Patient,Doctor,OperatorField,HospitalAdmin
from Lab.models import LabTech
from django.db import transaction
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes,force_str
from core.throttles import LoginRateThrottle,RegistrationRateThrottle,AdminLoginRateThrottle,PasswordResetRateThrottle

User = get_user_model()
logger = logging.getLogger(__name__)

USER_TYPES = {
    'PATIENT': 'patient',
    'DOCTOR': 'doctor',
    'OPERATOR': 'operator',
    'LAB TECHNICIAN': 'lab_tech',
    'ADMIN': 'admin'
}

def generate_token(user):
    refresh = RefreshToken.for_user(user)
    refresh['user_type'] = user.user_type
    refresh['username'] = user.username
    refresh['email'] = user.email
    refresh['is_approved'] = user.is_approved
    
    return {
        'refresh': str(refresh), 'access': str(refresh.access_token)
    }

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return match(pattern, email) is not None

class RegisterHospitalAdmin(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        if not request.user.is_superuser:
            return Response({'status':'error','message':'Unauthorized for this auction'},status=403)
        data = request.data
        
        required = ['email','full_name','admin_level']
        for field in required:
            if not data.get(field):
                return Response({'status':'error','message': f'{field} is required'},status=400)
        
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'status':'error','message':'User already exists'
            },status=400)
        alphabet = string.ascii_letters + string.digits
        temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=temp_password,
            first_name=data.get('first_name',''),
            last_name=data.get('last_name',''),
            is_staff=True,
            is_active=True,
        )
        admin = HospitalAdmin.objects.create(
            user=user,
            full_name=data['full_name'],
            email=data['email'],
            phone=data.get('phone', ''),
            admin_level=data.get('admin_level', 'operations'),
            department=data.get('department', ''),
            can_manage_users=data.get('can_manage_users', False),
            can_manage_doctors=data.get('can_manage_doctors', False),
            can_manage_departments=data.get('can_manage_departments', False),
            can_view_reports=data.get('can_view_reports', True),
            can_manage_billing=data.get('can_manage_billing', False),
            can_manage_settings=data.get('can_manage_settings', False),
        )
        send_mail(
            subject='Hosptial Admin Account created successfully',
            message=f'Your admin account has been created. \nTemporary password:{temp_password}',
            from_email='admin@smartcare.com',
            recipient_list=[user.email],
            fail_silently=True,
        )
        return Response({
            'status': 'success',
            'message': 'Hospital admin created successfully',
            'data': {
                'user_id': user.id,
                'email': user.email,
                'temporary_password': temp_password,  # Remove in production
                'admin': HospitalAdminSerializer(admin).data
            }
        }, status=201)

class PublicAdminRegistration(APIView):
    permission_classes = [AllowAny]
    @throttle_classes([RegistrationRateThrottle])

    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            full_name = request.data.get('full_name', '').strip()
            phone = request.data.get('phone', '').strip()

            if not all([email, password, full_name, phone]):
                return Response({'status': 'error', 'message': 'All fields are required'}, status=400)

            if not is_valid_email(email):
                return Response({'status': 'error', 'message': 'Invalid email format'}, status=400)

            if User.objects.filter(email=email).exists():
                return Response({'status': 'error', 'message': 'Email already registered'}, status=400)

            if len(password) < 8:
                return Response({'status': 'error', 'message': 'Password must be at least 8 characters'}, status=400)

            if password != confirm_password:
                return Response({'status': 'error', 'message': 'Passwords do not match'}, status=400)

            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=full_name,
                    is_staff=True,
                    is_active=False,
                )
                user.user_type = 'admin'
                user.is_approved = False
                user.save()

                admin = HospitalAdmin.objects.create(
                    user=user,
                    full_name=full_name,
                    email=email,
                    phone=phone,
                    admin_level='operations',
                    is_active=True,
                )

                return Response({
                    'status': 'success',
                    'message': 'Admin registration submitted for superuser approval',
                    'data': {
                        'email': user.email,
                        'name': full_name,
                        'status': 'pending_approval'
                    }
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)

class HospitalAdminLogin(APIView):
    permission_classes=[AllowAny]
    @throttle_classes([AdminLoginRateThrottle])
    def post(self,request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'status':'error',
                'message':'Email and password required'
            },status==status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise User.DoesNotExist
            
            if not hasattr(user,'hospital_admin'):
                return Response({'status':'success','message':'Unautjorized for this page'},status=status.HTTP_403_FORBIDDEN)
            if not user.hospital_admin.is_active:
                return Response({
                    'status':'error','messgae':'Admin account is inactive'
                },status=403)
            refresh = RefreshToken.for_user(user)

            return Response({
                'status':'success','message':'Login successful','data':{
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'full_name': user.hospital_admin.full_name,
                        'admin_level': user.hospital_admin.admin_level,
                    }
                }
            })
        except User.DoesNotExist:
            return Response({
                'status':'error',
                'message':'Invalid credentials'
            },status=status.HTTP_401_UNAUTHORIZED)

class SignUp(APIView):
    permission_classes = [AllowAny]
    @throttle_classes([RegistrationRateThrottle])
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            phone = request.data.get('phone', '').strip()
            age = request.data.get('age')
            gender = request.data.get('gender', '').strip()
            address = request.data.get('address', '').strip()
            
            if not email:
                return Response({
                    'status': 'error',
                    'message': 'Email is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not password:
                return Response({
                    'status': 'error',
                    'message': 'Password is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not first_name:
                return Response({
                    'status': 'error',
                    'message': 'First name is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not is_valid_email(email):
                return Response({
                    'status': 'error',
                    'message': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(username=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Username already taken'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(password) < 8:
                return Response({
                    'status': 'error',
                    'message': 'Password must be at least 8 characters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != confirm_password:
                return Response({
                    'status': 'error',
                    'message': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not any(char.isdigit() for char in password):
                return Response({
                    'status': 'error',
                    'message': 'Password must contain at least one number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not any(char.isupper() for char in password):
                return Response({
                    'status': 'error',
                    'message': 'Password must contain at least one uppercase letter'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email, 
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,  
                )
                user.user_type = 'patient'
                user.save()
                
                patient = Patient.objects.create(
                    user=user,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    age=age,
                    gender=gender,
                    address=address
                )
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'status': 'success',
                    'message': 'Registration successful',
                    'data': {
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'user_type': user.user_type,
                        },
                        'patient': {
                            'id': patient.id,
                            'first_name': patient.first_name,
                            'last_name': patient.last_name,
                            'email': patient.email,
                            'phone': patient.phone,
                            'age': patient.age,
                            'gender': patient.gender,
                            'address': patient.address,
                        },
                        'tokens': {
                            'access': str(refresh.access_token),
                            'refresh': str(refresh),
                        }
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DoctorRegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    @throttle_classes([RegistrationRateThrottle])
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            full_name = request.data.get('full_name', '').strip()
            phone = request.data.get('phone', '').strip()
            specialization = request.data.get('specialization', '').strip()
            license_number = request.data.get('license_number', '').strip()
            resume_file = request.FILES.get('resume') 
            
            if not all([email, password, full_name, phone, specialization, license_number, resume_file]):
                return Response({
                    'status': 'error',
                    'message': 'All required fields must be filled'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not is_valid_email(email):
                return Response({
                    'status': 'error',
                    'message': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(password) < 8:
                return Response({
                    'status': 'error',
                    'message': 'Password must be at least 8 characters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != confirm_password:
                return Response({
                    'status': 'error',
                    'message': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    phone=phone,
                    first_name=full_name,
                    is_active=False,
                )
                
                user.user_type = 'doctor'
                user.is_approved = False
                user.save()
                
                doctor = Doctor.objects.create(
                    user=user,
                    full_name=full_name,
                    email=email,
                    speciality=specialization,
                    license_number=license_number,
                    resume=resume_file,
                    phone_number=phone,
                    is_available=False,
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Registration submitted for admin approval. You will be notified once approved.',
                    'data': {
                        'email': user.email,
                        'name': f"{full_name}",
                        'specialization': specialization,
                        'status': 'pending_approval'
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LabTechnRegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    @throttle_classes([RegistrationRateThrottle])
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            username = request.data.get('username', '').strip()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            full_name = request.data.get('full_name', '').strip()
            phone = request.data.get('phone_number', '').strip()
            gender = request.data.get('gender', '').strip()
            resume_file = request.FILES.get('resume')
            license_number = request.data.get('license_number', '').strip()
            qualifications = request.data.get('qualifications', '').strip()
            department = request.data.get('department', '').strip()
            shift_time = request.data.get('shift_time', '').strip()
            date_of_birth = request.data.get('date_of_birth') or None

            try:
                experience_years = int(request.data.get('experience_years') or 0)
                if experience_years < 0:
                    raise ValueError
            except (TypeError, ValueError):
                return Response({
                    'status': 'error',
                    'message': 'Experience years must be a non-negative whole number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not all([email, username, password, confirm_password, full_name, phone, gender, license_number, resume_file]):
                return Response({
                    'status': 'error',
                    'message': 'Required fields missing'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not is_valid_email(email):
                return Response({
                    'status': 'error',
                    'message': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)

            if gender not in {'Male', 'Female'}:
                return Response({
                    'status': 'error',
                    'message': 'Invalid gender'
                }, status=status.HTTP_400_BAD_REQUEST)

            if len(password) < 8:
                return Response({
                    'status': 'error',
                    'message': 'Password must be at least 8 characters'
                }, status=status.HTTP_400_BAD_REQUEST)

            if password != confirm_password:
                return Response({
                    'status': 'error',
                    'message': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({
                    'status': 'error',
                    'message': 'Username already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=full_name,
                    phone=phone,
                    user_type='lab_technician',
                    is_active=False,
                    is_approved=False,
                )

                lab_technician = LabTech.objects.create(
                    user=user,
                    full_name=full_name,
                    email=email,
                    date_of_birth=date_of_birth,
                    phone_number=phone,
                    gender=gender,
                    qualifications=qualifications,
                    department=department,
                    shift_time=shift_time,
                    experience_years=experience_years,
                    resume=resume_file,
                    license_number=license_number,
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Lab technician registration submitted for approval',
                    'data': {
                        'email': user.email,
                        'name': f"{full_name}",
                        'status': 'pending_approval'
                    }
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OperatorRegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    @throttle_classes([RegistrationRateThrottle])
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            username = request.data.get('username', '').strip()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            full_name = request.data.get('full_name', '').strip()
            phone = request.data.get('phone', '').strip()
            shift_time = request.data.get('shift_time', '').strip()
            license_number = request.data.get('license_number', '').strip()
            resume_file = request.FILES.get('resume')
            
            if not all([email, username, password, confirm_password, full_name, phone, shift_time, license_number, resume_file]):
                return Response({
                    'status': 'error',
                    'message': 'Required fields missing'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not is_valid_email(email):
                return Response({
                    'status': 'error',
                    'message': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)

            if len(password) < 8:
                return Response({
                    'status': 'error',
                    'message': 'Password must be at least 8 characters'
                }, status=status.HTTP_400_BAD_REQUEST)

            if password != confirm_password:
                return Response({
                    'status': 'error',
                    'message': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({
                    'status': 'error',
                    'message': 'Username already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=full_name,
                    phone=phone,
                    user_type='operator',
                    is_active=False,
                    is_approved=False,
                )

                operator = OperatorField.objects.create(
                    user=user,
                    full_name=full_name,
                    email=email,
                    shift_time=shift_time,
                    phone_number=phone,
                    license_number=license_number,
                    resume=resume_file,
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Operator registration submitted for approval',
                    'data': {
                        'email': user.email,
                        'name': f"{full_name}",
                        'status': 'pending_approval'
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    @throttle_classes([LoginRateThrottle])
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            
            if not email or not password:
                return Response({
                    'status': 'error',
                    'message': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(request, username=email, password=password)
            
            if user is None:
                return Response({
                    'status': 'error',
                    'message': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'status': 'error',
                    'message': 'Account is inactive. Please contact admin.'
                }, status=status.HTTP_403_FORBIDDEN)
            if user.user_type in ['doctor', 'operator','admin','lab_technician'] and not user.is_approved:
                return Response({
                    'status': 'error',
                    'message': 'Account pending admin approval'
                }, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            
            profile = None
            if user.user_type == 'patient':
                try:
                    profile = Patient.objects.get(user=user)
                    profile_data = {
                        'id': profile.id,
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'phone': profile.phone,
                    }
                except Patient.DoesNotExist:
                    profile_data = None
            elif user.user_type == 'doctor':
                try:
                    profile = Doctor.objects.get(user=user)
                    profile_data = {
                        'id': profile.id,
                        'specialization': profile.specialization,
                        'department': profile.department
                    }
                except Doctor.DoesNotExist:
                    profile_data = None
            elif user.user_type == 'operator':
                try:
                    profile = OperatorField.objects.get(user=user)
                    profile_data = {
                        'id': profile.id,
                        'department': profile.department,
                        'shift_time': profile.shift_time
                    }
                except OperatorField.DoesNotExist:
                    profile_data = None
            else:
                profile_data = None
            
            return Response({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'user_type': user.user_type,
                        'is_approved': user.is_approved,
                        'is_active': user.is_active,
                    },
                    'profile': profile_data
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
class CurrentProfileApi(APIView):
    permission_classes = [IsAuthenticated]
    def get_client_ip(self,request):
        x_forwaded_for = request.META.get('HTTP_X_FORWARDED_FOR')   
        if x_forwaded_for:
            ip = x_forwaded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_user_profile_data(self, user):
        if user.user_type == 'patient':
            try:
                profile = Patient.objects.get(user=user)
                return {
                    'id': profile.id,
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'phone': profile.phone,
                }
            except Patient.DoesNotExist:
                return None
        elif user.user_type == 'doctor':
            try:
                profile = Doctor.objects.get(user=user)
                return {
                    'id': profile.id,
                    'specialization': profile.specialization,
                    'department': profile.department
                }
            except Doctor.DoesNotExist:
                return None
        elif user.user_type == 'operator':
            try:
                profile = OperatorField.objects.get(user=user)
                return {
                    'id': profile.id,
                    'department': profile.department,
                    'shift_time': profile.shift_time
                }
            except OperatorField.DoesNotExist:
                return None
        elif user.user_type == 'lab_tech':
            try:
                profile = LabTech.objects.get(user=user)
                return {
                    'id': profile.id,
                    'is_available': profile.is_available,
                }
            except OperatorField.DoesNotExist:
                return None
        return None

    def get_dashboard_url(self, user):
        user_type = getattr(user, 'user_type', None)
        if user_type == 'patient':
            return '/patient/dashboard'
        elif user_type == 'doctor':
            return '/doctor/dashboard'
        elif user_type == 'operator':
            return '/operator/dashboard'
        elif user_type in ['lab_tech', 'lab_technician']:
            return '/lab/dashboard'
        elif user_type == 'admin' or user.is_superuser:
            return '/admin/dashboard'
        return '/dashboard'
        
    def get_user_permissions(self, user):
        if hasattr(user, 'get_all_permissions'):
            return list(user.get_all_permissions())
        return []
    def get(self,request):
        user = request.user
        profie_data = self.get_user_profile_data(user)
        dashboard_url = self.get_dashboard_url(user)
        serializer = UserSerializer(user)
        
        return Response({
            'user': serializer.data,
            'status': 'success',
            'profile': profie_data,
            'dashboard_url': dashboard_url,
            'permissions': self.get_user_permissions(user),
            'session': {
                'last_login': user.last_login,
                'ip_address': self.get_client_ip(request)
            }
        },status=status.HTTP_200_OK)
    def patch(self,request):
        user = request.user
        
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            if User.objects.filter(email=request.data['email']).exclude(id=user.id).exists():
                return Response({
                    'status': 'error',
                    'Message': 'Email is already in use by another account'
                },status=status.HTTP_400_BAD_REQUEST)
            user.email = request.data['email']
            
        user.save(update_fields=['first_name','last_name','email'])
        self.update_role_profile(user,request.data)
        return Response({
            'status': 'success',
            'message': 'Profile updated successfully'
        },status=status.HTTP_200_OK)
    def update_role_profile(self,user,data):
        if user.user_type == USER_TYPES['PATIENT']:
            try:
                patient = Patient.objects.get(user=user)
                if 'phone' in data:
                    patient.phone = data['phone']
                if 'age' in data:
                    patient.age = data['age']
                if 'gender' in data:
                    patient.gender = data['gender']
                if 'address' in data:
                    patient.address = data['address']
                patient.save(update_fields=['phone','age','gender','address'])
            except Patient.DoesNotExist:
                pass
        elif user.user_type == USER_TYPES['DOCTOR']:
            try:
                doctor = Doctor.objects.get(user=user)
                if 'phone_number' in data:
                    doctor.phone_number = data['phone_number']
                if 'speciality' in data:
                    doctor.speciality = data['speciality']
                doctor.save(update_fields=['phone_number','speciality'])
            except Doctor.DoesNotExist:
                pass
        elif user.user_type == USER_TYPES['OPERATOR']:
            try:
                operator = OperatorField.objects.get(user=user)
                if 'phone_number' in data:
                    operator.phone_number = data['phone_number']
                if 'shift_time' in data:
                    operator.shift_time = data['shift_time']
                operator.save(update_fields=['phone_number','shift_time'])
            except OperatorField.DoesNotExist:
                pass
            
class Logout(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            refresh = request.data.get('refresh')
            token = RefreshToken(refresh)
            token.blacklist()
            
            return Response({
                'status': 'success',
                'Message': 'Logout successful'
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'Message': "Invalid token or already logged out"
            },status=status.HTTP_400_BAD_REQUEST)
                
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'status': 'error',
                'Message': 'Refresh token is required'
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            
            user_id = refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)
            
            if not user.is_active:
                return Response({
                    'status': 'error',
                    'Message': 'User account is inactive'
                },status=status.HTTP_403_FORBIDDEN)
            
            access_token = str(refresh.access_token)
            return Response({
                'status': 'success',
                'access': access_token,
                'expires_in': int(refresh.access_token.lifetime.total_seconds())
            },status=status.HTTP_200_OK)
        except TokenError:
            return Response({
                'status': 'error',
                'Message': 'Invalid refresh token! Please log in again.'
            },status=status.HTTP_401_UNAUTHORIZED)

class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            old = serializer.validated_data['old']
            new = serializer.validated_data['new']
            confirm = serializer.validated_data['confirm']
            
            if not user.check_password(old):
                return Response({
                    'status': 'error',
                    'Message': 'Old password is incorrect'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if new != confirm:
                return Response({
                    'status': 'error',
                    'Message': 'New passwords do not match'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if old == new:
                return Response({
                    'status': 'error',
                    'Message': 'New password cannot be the same as the old password'
                },status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new)
            user.save()
            
            return Response({
                'status': 'success',
                'Message': 'Password changed successfully'
            },status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'errors': serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)

class ForgotPassword(APIView):
    permission_classes = [AllowAny]
    @throttle_classes([PasswordResetRateThrottle])
    def post(self,request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'message': serializer.errors['email'][0]
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'status': 'success',
                'Message': 'If an account with that email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)

        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            logger.error('Password reset email not sent: SMTP credentials are not configured.')
            return Response({
                'status': 'error',
                'message': 'Password reset email is not configured. Please contact support.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        try:
            sent_count = send_mail(
                subject='Password Reset Request - SmartCare Hospital',
                message=f'Hi {user.first_name},\n\nWe received a request to reset your password for your SmartCare account. Please click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nSmartCare Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
        except (smtplib.SMTPException, OSError, ValueError):
            logger.exception('Password reset email delivery failed.')
            return Response({
                'status': 'error',
                'message': 'Unable to send reset email. Please check the email service configuration.'
            }, status=status.HTTP_502_BAD_GATEWAY)

        if sent_count != 1:
            logger.error('Password reset email backend did not send a message for user ID %s.', user.pk)
            return Response({
                'status': 'error',
                'message': 'Unable to send reset email. Please try again later.'
            }, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            'status': 'success',
            'Message': 'If an account with that email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)

class ResetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'message': next(iter(serializer.errors.values()))[0]
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'status': 'error',
                'message': 'Invalid or expired password reset link.'
            }, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({
                'status': 'error',
                'message': 'Invalid or expired password reset link.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({
            'status': 'success',
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)

class VerifyToken(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        return Response({
            'status': 'success',
            'Message': 'Token is valid',
            'uid': request.user.id,
            'username': request.user.username,
            'is_approved': request.user.is_approved,
            'user_type': request.user.user_type
        },status=status.HTTP_200_OK)
        