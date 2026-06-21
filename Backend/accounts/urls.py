from .api import SignUp,LoginAPIView,ChangePassword,CurrentProfileApi,RefreshToken,ForgotPassword,VerifyToken,Logout,DoctorRegistrationAPIView,LabTechnRegistrationAPIView,OperatorRegistrationAPIView,RegisterHospitalAdmin,HospitalAdminLogin
from django.urls import path

urlpatterns = [
    path('admin/register',RegisterHospitalAdmin.as_view(),name='admin_register'),
    path('admin/login/',HospitalAdminLogin.as_view(),name='admin_login'),
    path('signup/',SignUp.as_view(),name='signup'),
    path('doctor/register/',DoctorRegistrationAPIView.as_view(),name='doctor_register'),
    path('lab/register/',LabTechnRegistrationAPIView.as_view(),name='lab_register'),
    path('operator/register/',OperatorRegistrationAPIView.as_view(),name='operator_register'),
    path('login/',LoginAPIView.as_view(),name='login'),
    path('logout/',Logout.as_view(),name='logout'),
    path('refresh_token/',RefreshToken.as_view(),name='refresh_token'),
    path('forgot-password/',ForgotPassword.as_view(),name='forgot_password'),
    path('profile/',CurrentProfileApi.as_view(),name='current_profile'),
    path('change-password/',ChangePassword.as_view(),name='change_password'),
    path('verify_token/',VerifyToken.as_view(),name='verify_token'),
]