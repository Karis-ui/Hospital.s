from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from core.models import Patient, Doctor, MedicalRecords, VitalSign, Appointment
from Hospital.Api.serializers import MedicalRecordSerializer, VitalSignSerializer
from Hospital.Api.permissions import IsDoctor


class DoctorPatientMedicalRecordsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]
    
    def get(self, request, patient_id):
        doctor = get_object_or_404(Doctor, user=request.user)
        patient = get_object_or_404(Patient, id=patient_id)
        
        has_treated = Appointment.objects.filter(
            doctor=doctor,
            patient=patient
        ).exists()
        
        if not has_treated:
            return Response({
                'error': 'You have not treated this patient'
            }, status=status.HTTP_403_FORBIDDEN)
        
        records = MedicalRecords.objects.filter(patient=patient).order_by('-recorded_date')
        
        return Response({
            'patient': {
                'id': patient.id,
                'name': f"{patient.first_name} {patient.last_name}",
                'age': patient.age,
                'gender': patient.gender,
                'phone': patient.phone,
                'email': patient.email,
            },
            'records': MedicalRecordSerializer(records, many=True).data,
        }, status=status.HTTP_200_OK)
    
    
class CreateMedicalRecord(APIView):
    def post(self, request, patient_id):
        doctor = get_object_or_404(Doctor, user=request.user)
        patient = get_object_or_404(Patient, id=patient_id)
        
        has_treated = Appointment.objects.filter(
            doctor=doctor,
            patient=patient
        ).exists()
        
        if not has_treated:
            return Response({
                'error': 'You have not treated this patient'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicalRecordSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                patient=patient,
                doctor=doctor,
                created_by=request.user,
                recorded_date=timezone.now().date()
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DoctorPatientVitalsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]
    
    def get(self, request, patient_id):
        doctor = get_object_or_404(Doctor, user=request.user)
        patient = get_object_or_404(Patient, id=patient_id)
        
        has_treated = Appointment.objects.filter(
            doctor=doctor,
            patient=patient
        ).exists()
        
        if not has_treated:
            return Response({
                'error': 'You have not treated this patient'
            }, status=status.HTTP_403_FORBIDDEN)
        
        vitals = VitalSign.objects.filter(patient=patient).order_by('-recorded_at')[:20]
        
        return Response({
            'patient': {
                'id': patient.id,
                'name': f"{patient.first_name} {patient.last_name}",
                'age': patient.age,
                'gender': patient.gender,
                'phone': patient.phone,
                'email': patient.email,
            },
            'vitals': VitalSignSerializer(vitals, many=True).data,
        }, status=status.HTTP_200_OK)
    
    
class CreatePatientVitals(APIView):
    def post(self, request, patient_id):
        doctor = get_object_or_404(Doctor, user=request.user)
        patient = get_object_or_404(Patient, id=patient_id)
        
        has_treated = Appointment.objects.filter(
            doctor=doctor,
            patient=patient
        ).exists()
        
        if not has_treated:
            return Response({
                'error': 'You have not treated this patient'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = VitalSignSerialzer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                patient=patient,
                doctor=doctor,
                created_by=request.user,
                recorded_date=timezone.now().date()
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    