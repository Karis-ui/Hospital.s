from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from core.models import Appointment
from rest_framework import status
import random,string
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from .serializers import SignUp,LoginSerializer,ForgotPassword,ChangePasswordSerializer,UserProfile
from Hospital.Api.serializers import UserSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from core.models import Patient,Doctor,OperatorField
from Lab.models import LabTech
from .models import CustomUser as User
from django.db import transaction
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes,force_str

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
    return re.match(pattern, email) is not None

class SignUp(APIView):
    permission_classes = [AllowAny]
    
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
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            phone = request.data.get('phone', '').strip()
            specialization = request.data.get('specialization', '').strip()
            license_number = request.data.get('license_number', '').strip()
            qualifications = request.data.get('qualifications', '').strip()
            
            if not all([email, password, first_name, last_name, specialization, license_number]):
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
                    first_name=first_name,
                    last_name=last_name,
                    is_active=False,
                )
                
                user.user_type = 'doctor'
                user.is_approved = False
                user.save()
                
                doctor = Doctor.objects.create(
                    user=user,
                    specialization=specialization,
                    license_number=license_number,
                    qualifications=qualifications,
                    phone=phone,
                    is_available=False,
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Registration submitted for admin approval. You will be notified once approved.',
                    'data': {
                        'email': user.email,
                        'name': f"{first_name} {last_name}",
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
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            full_name = request.data.get('first_name', '').strip()
            phone = request.data.get('phone', '').strip()
            gender = request.data.get('department', '').strip()
            qualifications = request.data.get('qualifications', '').strip()
            license_number = request.data.get('license_number', '').strip()
            date_of_birth = request.data.get('date_of_birth', '').strip()
            
            if not all([email, password, full_name]):
                return Response({
                    'status': 'error',
                    'message': 'Required fields missing'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    full_name=full_name,
                    is_active=False,
                )
                
                user.user_type = 'lab_technician'
                user.is_approved = False
                user.save()
                
                lab_technician = Lab.objects.create(
                    user=user,
                    department=department,
                    phone=phone,
                    gender=gender,
                    qualifications=qualifications,
                    license_number=license_number,
                    date_of_birth=date_of_birth,
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
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            phone = request.data.get('phone', '').strip()
            department = request.data.get('department', '').strip()
            
            if not all([email, password, first_name, last_name]):
                return Response({
                    'status': 'error',
                    'message': 'Required fields missing'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=False,
                )
                
                user.user_type = 'operator'
                user.is_approved = False
                user.save()
                
                operator = OperatorField.objects.create(
                    user=user,
                    department=department,
                    phone=phone,
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Operator registration submitted for approval',
                    'data': {
                        'email': user.email,
                        'name': f"{first_name} {last_name}",
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
            if user.user_type in ['doctor', 'operator'] and not user.is_approved:
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
    def get(self,request):
        user = request.user
        profie_data = get_user_profile_data(user)
        dashboard_url = get_dashboard_url(user)
        serializer = UserSerializer(user)
        
        return Response({
            'user': serializer.data,
            'status': 'success',
            'profile': profie_data,
            'dashboard_url': dashboard_url,
            'permissions': self.get_user_permissions(user),
            'session': {
                'last_login': user.last_login,
                'ip_address': get_client_ip(request)
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
    def get_client_ip(self,request):
        x_forwaded_for = request.META.get('HTTP_X_FORWARDED_FOR')   
        if x_forwaded_for:
            ip = x_forwaded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
            
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
                
class RefreshToken(APIView):
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
    def post(self,request):
        serializer = ForgotPassword(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token_generator = PasswordResetTokenGenerator()
                token = token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                current_site = get_current_site(request)
                reset_link = f"{request.scheme}://{current_site.domain}/reset-password/{uid}/{token}/"
                send_mail(
                    subject='Password Reset  Request - SmartCare Hospital',
                    message=f'Hi {user.first_name},\n\nWe received a request to reset your password for your SmartCare account. Please click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nSmartCare Team',
                    from_email='noreply@smartcare.com',
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except User.DoesNotExist:
                pass
            return Response({
                'status': 'success',
                'Message': 'If an account with that email exists, a password reset link has been sent.'
            },status=status.HTTP_200_OK)

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
        