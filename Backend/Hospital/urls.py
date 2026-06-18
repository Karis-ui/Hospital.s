"""
URL configuration for Hospital project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse
from rest_framework_simplejwt.views import(
    TokenObtainPairView,TokenRefreshView
)

def home(request):
    return JsonResponse({
        "message": "Welcome to SmartCare Hospital Management API",
        "endpoints": {
            "admin": "/admin/",
            "api_token": "/api/token/",
            "api_token_refresh": "/api/token/refresh/",
            "api_accounts": "/api/accounts/",
            "api_patients": "/api/patients/",
            "api_doctors": "/api/doctors/",
            "api_billoperator": "/api/billoperator/",
        }
    })
    
def health_check(request):
    return JsonResponse({'status':'ok','message':'Backend is up and running'})

urlpatterns = [
    path('',home,name='home'),
    path('health/',health_check,name='health_check`'),
    path('admin/', admin.site.urls),
    path('api/token/',TokenObtainPairView.as_view()),
    path('api/token/refresh/',TokenRefreshView.as_view()),
    path('', include('core.urls')),
    path('api/accounts/',include('accounts.urls')),
    path('api/patients/',include('patients.urls')),
    path('api/doctors/',include('doctors.urls')),
    path('api/billoperator/',include('billoperator.urls')),
    path('api/labtech/',include('Lab.urls')),
]
