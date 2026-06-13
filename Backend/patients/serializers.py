from rest_framework import serializers
from core.models import Appointment,Prescription,Bill,LabReport,Doctor

class AppointmentSearch(serializers.MedicalSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name')
    doctor_speciality = serializers.CharField(source='doctor.speciality')
    
    class Meta:
        model = Appointment
        fields = ['id','doctor_name','doctor_speciality','appointment_date','appointment_time','status','purpose']

class PrescriptionSearch(serializers.MedicalSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name')
    
    class Meta:
        model = Prescription
        fields = ['id','doctor_name','diagnosis','instructions','medication','status','prescribed_at']
        
class BillSearch(serializers.MedicalSerializer):
    bill_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = ['id','bill_nmber','amount','payment_method','created_at','payment_status','notes']
        
    def get_bill_no(self,obj):
        return f"INV-{obj.id:06d}"