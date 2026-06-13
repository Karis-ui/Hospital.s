from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from core.models import Appointment
from rest_framework import status
from .serializers import AppointmentSerializer,ReportSerializer,DoctorSerializer,PatientSerializer,BillSerializer,LabRequestSerializer,LabReportSerializer
from rest_framework.views import APIView

@api_view(['GET'])
def appointments_api(request):
    user = request.user
    
    if user.user_type == 'admin':
        qs = Appointment.objects.all()
    elif user.user_type == 'doctor':
        qs = Appointment.objects.filter(doctor__user=user)
    elif user.user_type == 'patient':
        qs = Appointment.objectsfilter(patient__user=user)
    else:
        return Response({'Error': 'Forbidden'},status=403)
    
    return Response(AppointmentSerializer(qs,many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patients_api(request):
    user = request.user
    
    if user.user_type == 'admin':
        qs = Patient.objects.all()
    elif user.user_type == 'patient':
        qs = Patient.objects.filter(user=user)
    else:
        return Response({'Error': 'Forbidden'},status=403)
    
    return Response(PatientSerializer(qs,many=True).data)