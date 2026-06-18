# backend/Hospital/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView
)

# Simple health check that always works
def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is running"})

def root_view(request):
    return JsonResponse({
        "message": "Smartcare Hospital Management System API",
        "status": "running"
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('health/', health_check, name='health_check'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # JWT
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    
    path('', include('core.urls')),
    path('accounts/', include('accounts.urls')),
    path('patients/', include('patients.urls')),
    path('doctors/', include('doctors.urls')),
    path('billoperator/', include('billoperator.urls')),
    path('Lab/',include('Lab.urls')),
]
