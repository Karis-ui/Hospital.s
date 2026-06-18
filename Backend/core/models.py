import secrets
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.urls import reverse
from accounts.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    date_of_birth = models.DateField(null=True, blank=True)
    gender_choices = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    gender = models.CharField(max_length=10, choices=gender_choices)
    speciality = models.CharField(max_length=120)
    available = models.BooleanField(default=True)
    department = models.CharField(max_length=120)
    phone_number = models.CharField(max_length=120)
    is_available = models.BooleanField(default=True)
    qualifications = models.TextField()
    license_number = models.CharField(max_length=100)
    doctor_photo = models.ImageField(upload_to='doctor_photos/',null=True,blank=True)

    def __str__(self):
        return f"Dr.{self.user.username}"

class Patient(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender_choices = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    gender = models.CharField(max_length=10, choices=gender_choices)
    age = models.IntegerField(null=True,blank=True)
    phone = models.CharField(max_length=10,unique=True)
    email = models.CharField(max_length=100,unique=True)
    address = models.CharField(max_length=100)
    medical_history = models.TextField(null=True, blank=True)
    patient_photo = models.ImageField(upload_to='patient_photos/',null=True,blank=True)
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
class MedicalRecords(models.Model):
    RECORD_TYPE_CHOICES = [
        ('condition', 'Medical Condition'),
        ('allergy', 'Allergy'),
        ('medication', 'Medication'),
        ('diagnosis', 'Diagnosis'),
        ('immunization', 'Immunization / Vaccine'),
        ('lab', 'Lab'),
        ('social_history', 'Social History'),
        ('vital', 'Vital Sign'),
        ('notes', 'Clinical Note'),
        ('document', 'Document'),
    ]
    patient = models.ForeignKey(Patient,on_delete=models.CASCADE)
    record_type = models.CharField(max_length=20,choices=RECORD_TYPE_CHOICES)
    doctor = models.ForeignKey(Doctor,on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    vitals = models.JSONField(default=dict,blank=True)
    data = models.JSONField(default=dict,blank=True)
    
    icd10_code = models.CharField(max_length=20, blank=True, help_text="ICD-10 diagnosis code")
    snomed_code = models.CharField(max_length=20, blank=True, help_text="SNOMED CT code")
    loinc_code = models.CharField(max_length=20, blank=True, help_text="LOINC code for labs")
    visit_date = models.DateTimeField(default=timezone.now)
    visit_type = models.CharField(max_length=50, choices=[
        ('office', 'Office Visit'),
        ('emergency', 'Emergency'),
        ('follow_up', 'Follow-up'),
        ('consultation', 'Consultation'),
        ('procedure', 'Procedure'),
        ('admission', 'Admission'),
        ('discharge', 'Discharge'),
    ])
    diagnosis = models.TextField(blank=True)
    assessment = models.TextField(blank=True)
    plan = models.TextField(blank=True)
    history = models.TextField(blank=True, help_text="History of present illness")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    status = models.CharField(max_length=20,default='active',choices=[
        ('active','Active'),
        ('cancelled','Cancelled'),
        ('completed','Completed'),
    ])
    
    def __str__(self):
        return f'{self.patient} - {self.get_record_type_display()}'
     
class VitalSign(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    medical_record = models.ForeignKey(MedicalRecords, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)
    heart_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    respiratory_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    oxygen_saturation = models.PositiveSmallIntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    pain_level = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(10)])
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Vital Signs"
    
    @property
    def bmi(self):
        if self.weight and self.height and self.height > 0:
            height_m = self.height / 100
            return round(self.weight / (height_m ** 2), 1)
        return None
    
    def __str__(self):
        return f"{self.patient} - {self.date.strftime('%Y-%m-%d %H:%M')}"

class Prescription(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    diagnosis = models.TextField()
    medication = models.TextField()
    instructions = models.TextField()
    prescribed_at = models.DateTimeField(auto_now_add=True)
    is_urgent = models.BooleanField(default=False)
    status_choices = [
        ('active','Active'),
        ('inactive','Inactive')
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='active')

    class Meta:
        indexes = [
            models.Index(fields=['patient','prescribed_at']),
            models.Index(fields=['diagnosis']),
            models.Index(fields=['status'])
        ]
    
class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    created_at = models.DateTimeField()
    appointment_time = models.TimeField()
    duration = models.PositiveIntegerField(default=30)
    purpose = models.CharField(max_length=100,null=False, blank=False)
    status_choices =[
        ('Requested','Requested'),
        ('Scheduled','Scheduled'),
        ('Rescheduled','Rescheduled'), 
        ('Confirmed','Confirmed'), 
        ('Completed','Completed'),
        ('Cancelled','Cancelled'),
    ]
    status = models.CharField(max_length=100, choices=status_choices,default='Requested')

    is_emergency = models.BooleanField(default=False)
    priority = models.CharField(default='Normal',max_length=100)
    emergency_reason = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(CustomUser,null=True,on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.patient.user.username}->{self.doctor.user.username} ({self.status})"
    
    class Meta:
        indexes = [
            models.Index(fields=['patient','appointment_date']),
            models.Index(fields=['doctor','appointment_date']),
            models.Index(fields=['status'])
        ]

class OperatorField(models.Model):
    user = models.OneToOneField(CustomUser,on_delete=models.CASCADE)
    full_name = models.CharField(max_length=120,blank=False,null=False)
    email = models.EmailField(max_length=100,blank=False,null=False)
    department = models.CharField(max_length=100)
    shift_time = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=100)
    qualification = models.CharField(max_length=100)
    staff_photo = models.ImageField(upload_to='operator_photos/',null=True,blank=True  )

    def __str__(self):
        return f"Operator {self.user.username}-{self.department}"

class Bill(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    amount_received = models.DecimalField(max_digits=10,decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    clearance_date = models.DateTimeField(null=True, blank=True)
    payment_status = [
        ('Pending','Pending'),
        ('Cleared','Cleared'),
        ('Overdue','Overdue'),
    ]
    payment_status = models.CharField(max_length=10, choices=payment_status,default='Pending')
    payment_method = models.CharField(max_length=50,choices=[('Cash','Cash'),('Credit Card','Credit Card'),('Debit Card','Debit Card'),('M-Pesa','M-Pesa'),('Cheque','Cheque'),('Insurance','Insurance')] ,null=True, blank=True)
    notes = models.TextField()
    is_receipt_available = models.BooleanField(default=False)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Bill for {self.patient.user.username} on {self.created_at.date()} - {self.payment_status}"
    
    class Meta:
        indexes = [
            models.Index(fields=['patient','created_at']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['payment_method'])
        ]

class Report(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='reports/', blank=True)
    is_sent_to_patient = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True,blank=False)

    access_token = models.CharField(max_length=100,blank=True,null=True,unique=True)
    token_expires_at = models.DateTimeField(null=True,blank=True)
    token_used = models.BooleanField(default=False)

    def generate_access_token(self,minutes=60):
        token = secrets.token_urlsafe(24)
        self.access_token = token
        self.token_expires_at = timezone.now() + timedelta(minutes=minutes)
        self.token_used = False
        self.save(update_fields=['access_token','token_expires_at','token_used'])
        return token
    def token_valid(self,token):
        if not self.access_token or not token != self.access_token:
            return False
        if self.token_used:
            return False
        if self.token_expires_at and timezone.now() > self.token_expires_at:
            return False
        return True
    def mark_token_used(self):
        self.token_used = True
        self.save(update_fields=['token_used'])

    def __str__(self):
        return f"Report for {self.patient.user.first_name} by {self.doctor.user.full_name}"

    def upload_to(instance, filename):
        return f"reports/doctor_{instance.doctor.user.username}/report_{instance.id}.pdf"

class ReportAccessLog(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    accessed_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True,blank=True)
    method = models.CharField(max_length=100,choices=[('email','Email'),('link','link'),('download','download')])
    ip_address = models.GenericIPAddressField(null=True,blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField()

    def __str__(self):
        return f"Accessing {self.report.id} @ {self.timestamp}"

class Activity(models.Model):
    message = models.CharField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} - {self.message}"

class AdminAnnouncement(models.Model):
    title = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} {self.message}"

class AdminReport(models.Model):
    REPORT_TYPES = [
        ('users', 'User Report'),
        ('doctors', 'Doctor Report'),
        ('patients', 'Patient Report'),
        ('billing', 'Billing Report'),
        ('audit', 'Audit Log Report'),
        ('custom', 'Custom Report'),
    ]
    FORMAT_CHOICES = [
        ('pdf', 'PDF Document'),
        ('excel', 'Excel Spreadsheet'),
        ('csv', 'CSV File'),
        ('json', 'JSON Data'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100,choices=REPORT_TYPES)
    format = models.CharField(max_length=10,choices=FORMAT_CHOICES,default='pdf')
    file = models.FileField(upload_to='reports/%Y/%m/%d/',null=True,blank=True)
    file_size = models.PositiveIntegerField(default=0)
    filters = models.JSONField(default=dict,blank=True)
    date_range_start = models.DateTimeField(null=True,blank=True)
    date_range_end = models.DateTimeField(null=True,blank=True)
    
    generated_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='generated_reports')
    status = models.CharField(max_length=20,default='pending',choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True)
    download_count = models.PositiveIntegerField(default=0)
    last_download_at = models.DateTimeField(null=True,blank=True)
    
    class Meta:
        ordering = ['-last_download_at']
    def __str__(self):
        return f'{self.name} - {self.last_download_at}'

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE','Create'),
        ('UPDATE','Update'),
        ('DELETE','Delete'),
        ('VIEW','View Records'),
        ('LOGIN','Login'),
        ('LOGOUT','Logout'),
        ('APPROVE','Approve'),
        ('REJECT','Reject'),
        ('EXPORT','Export'),
        ('EMAIL','Email'),
        ('EMERGENCY_OVERRIDE','EMERGENCY Override'),
        ('REPORT_GENERATE','REPORT GENERATE'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES,default='CREATE')
    module = models.CharField(max_length=100)
    object_id = models.CharField(max_length=10,null=True,blank=True)
    object_type = models.CharField(max_length=15,blank=True,null=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True,blank=True)
    user_agent = models.TextField(null=True,blank=True)
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.action}"
 
 
class Notification(models.Model):
    TYPES = (
        ('appointment','Appointment'),
        ('prescription','Prescription'),
        ('billing','Billing'),
        ('report','Report'),
        ('emergency','Emergency'),
        ('system','System'),
    )
     
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='notifications')
    title = models.CharField(max_length=300)
    message = models.TextField()
    notification_type = models.CharField(max_length=50,choices=TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
     
    def __str__(self):
         return f'{self.user.username} - {self.title} ({self.created_at})' 

