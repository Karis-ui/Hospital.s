from core.models import Patient,Doctor,Prescription,MedicalRecords,VitalSign
from Lab.models import labRequest,LabReport
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status,viewsets,generics
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Hospital.Api.serializers import (
    PatientSerializer,DoctorSerializer,LabReportSerializer,LabRequestSerializer,MedicalRecordSerializer,VitalSignSerializer
)
from Hospital.Api.permissions import IsPatient,IsDoctor

class PatientMedicalView(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        patient = get_object_or_404(Patient,user=request.user)
        records = MedicalRecords.objects.filter(patient=patient).order_by('-created_at')
        grouped = {
            'diagnoses': records.filter(record_type__in=['diagnosis','condition']),
            'medications': records.filter(record_type='medication',status='active'),
            'allergies': records.filter(record_type='allergy'),
            'lab_results': records.filter(record_type='lab'),
            'procedures': records.filter(record_type='procedure'),
            'immunizations': records.filter(record_type='immunization'),
            'notes': records.filter(record_type__in=['notes','social_history','document']),
            }
        
        vitals = VitalSign.objects.filter(patient=patient).order_by('recorded_at')[:20]
        return Response({
            'patient':{
                'id': patient.id,
                'name': f"{patient.first_name} {patient.last_name}",
                'age': patient.age,
                'gender': patient.gender,
            },
            'records':{ key: MedicalRecordSerializer(value,many=True).data for key,value in grouped.items()},
            'vitals':VitalSignSerializer(vitals,many=True).data
        },status=status.HTTP_200_OK)
    
    def post(self,request):
        patient = get_object_or_404(Patient,user=request.user)
        serializer = MedicalRecordSerialzer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(patient=patient,created_at=timezone.now().date())
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        
        return Response(serialzer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class PatientVitalsView(APIView):
    permission_classes = [IsAuthenticated,IsPatient]
    def get(self,request):
        patient = get_object_or_404(Patient,user=request.user)
        vitals = VitalSign.objects.filter(patient=patient).order_by('-recorded_at')
        serializer = VitalSignSerializer(vitals,many=True)
        return Respinse(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request):
        patient = get_object_or_404(Patient,user=request.user)
        serializer = VitalSIgnSerialzer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(patient=patient,recorded_at=timezone.now().date())
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        
        return Response(serialzer.errors,status=status.HTTP_400_BAD_REQUEST)
        