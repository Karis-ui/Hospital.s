from rest_framework import serializers
from core.models import Appointment,Bill,Patient,Doctor,Report,OperatorField,Prescription,AuditLog,Notification,MedicalRecords,VitalSign,AdminReport,HospitalAdmin
from Lab.models import labRequest,LabReport,LabTech,TestParameter,TestProfile
from system.models import SystemSettings

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    class Meta:
        model = Appointment
        fields = '__all__'
    
    old_date = serializers.DateField(format="%Y-%m-%d",input_formats=['%Y-%m-%d'])
    new_date = serializers.DateField(format="%Y-%m-%d",input_formats=['%Y-%m-%d'])
    new_time = serializers.TimeField(format="%H:%M",input_formats=['%H:%M'])
        
    def get_patient_name(self,obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}".strip()
    def get_doctor_name(self,obj):
        return obj.doctor.user.get_full_name() if obj.doctor else None
    
    def validate(self,data):
        if data['new_date'] < data['old_date']:
            raise serializers.ValidationError('Doctor might be occupied on earlier date.Select a later date!')
        return data

class HospitalAdminSerializer(serializers.Serializer):
    class Meta:
        models = HospitalAdmin
        fields = '__all__'

class AdminReportSerializer(serializers.Serializer):
    class Meta:
        models = AdminReport
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'

class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorField
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = Patient
        fields = '__all__'
        
    def getFullName(self,obj):
        return f"{obj.first_name} {obj.last_name}".strip()
        
class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name',read_only=True)
    class Meta:
        model = Doctor
        fields = '__all__'
        
class LabRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = labRequest
        fields = '__all__'

class LabReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabReport
        fields = '__all__'
        
class LabTechSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTech
        fields = '__all__'

class TestProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestProfile
        fields = '__all__'

class TestParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestParameter
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_url = serializers.SerializerMethodField()
    class Meta:
        model = Report
        fields = '__all__'
    def get_patient_name(self,obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}".strip()
    def get_doctor_url(self,obj):
        if obj.access_token:
            return f"/api/reports/download/{obj.access_token}/"
        return None

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"
        
class NotificationSerializer(serializers.Serializer):
    class Meta:
        model = Notification
        fields = '__all__'

class UserSerializer(serializers.Serializer):
    class Meta:
        model = Bill,Patient,Doctor,Report,OperatorField,LabTech
        fields = '__all__'

class MedicalRecordSerializer(serializers.Serializer):
    class Meta:
        model = MedicalRecords
        fields = '__all__'

class VitalSignSerializer(serializers.Serializer):
    class Meta:
        model = VitalSign
        fields = '__all__'

class SettingSerializer(serializers.Serializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'