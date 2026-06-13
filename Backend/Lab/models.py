from django.db import models
from core.models import Doctor, Patient
from accounts.models import CustomUser
from django.utils import timezone
from datetime import timedelta

class LabTech(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    date_of_birth = models.DateField(null=True, blank=True)
    gender_choices = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    gender = models.CharField(max_length=10, choices=gender_choices)
    available = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=120)
    is_available = models.BooleanField(default=True)
    qualifications = models.TextField()
    license_number = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='lab_photos',null=True,blank=True)

    def __str__(self):
        return f"Lab Technician.{self.user.username}"
    
class TestProfile(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50,unique=True)
    category = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    description_type= models.CharField(max_length=100)
    fasting_required = models.BooleanField(default=False)
    is_active= models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
class TestParameter(models.Model):
    test_profile = models.ForeignKey(TestProfile,on_delete=models.CASCADE,related_name='parameters')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50,blank=True)
    unit = models.CharField(max_length=50)
    reference_range_low = models.DecimalField(max_digits=10,decimal_places=2,null=True)
    reference_range_high = models.DecimalField(max_digits=10,decimal_places=2,blank=True)
    reference_range_text = models.CharField(max_length=200,blank=True)
    decimal_places = models.IntegerField(default=1)
    sort_order = models.IntegerField(default=0)
    is_critical= models.BooleanField(default=False)
    is_required= models.BooleanField(default=True)
    
    class Meta:
        ordering = ['sort_order']
    @property
    def reference_range(self):
        if self.reference_range_text:
            return self.reference_range_text
        if self.reference_range_low and self.reference_range_high:
            return f'{self.reference_range_low} - {self.reference_range_high}'
        if self.reference_range_low:
            return f'>{self.reference_range_low}'
        if self.reference_range_high:
            return f'<self.reference_range_high'
        return 'Not Specified.'
   
class labRequest(models.Model):
    TEST_CHOICES = [
        ('blood','blood_test'),
        ('urine','urine_test'),
        ('X-Ray','X-Ray'),
        ('pathology','Pathology'),
        ('radiology','Radiology'),
        ('other','other'),
    ]
    status_choices = [
        ('requested','Requested'),
        ('sample_taken','Sample Taken'),
        ('ready','Ready'),
        ('cancelled','Cancelled'),
    ]
    test_profile = models.ForeignKey('TestProfile',on_delete=models.SET_NULL,null=True,help_text='Test profile defining expected parameters.')
    structured_results = models.JSONField(default=dict,blank=False)
    patient = models.ForeignKey(Patient,on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor,on_delete=models.CASCADE)
    
    test_type = models.CharField(max_length=50,choices=TEST_CHOICES)
    test_name = models.CharField(max_length=100,null=True)
    notes = models.TextField(blank=True)
    urgency = models.CharField(max_length=10,choices=[('normal','Normal'),('urgent','Urgent')],default='normal')
    status = models.CharField(max_length=20,choices=status_choices,default='Requested')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.test_type} for {self.patient.user.username} ordered by Dr.{self.doctor.user.username}'
    
class LabReport(models.Model):
    lab_request = models.OneToOneField(
        labRequest,on_delete=models.CASCADE,related_name='result'
    )
    by = models.ForeignKey(
        CustomUser,on_delete=models.SET_NULL,null=True
    )
    structured_results = models.JSONField(default=dict,blank=False)
    quality_control_passed = models.BooleanField(default=False)
    quality_control_notes = models.TextField(blank=True)
    is_critical = models.BooleanField(default=False)
    report_file = models.FileField(upload_to='lab_results/')
    remarks = models.TextField(null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status_choices = [
        ('pending','Pending Review'),
        ('approved','Approved'),
        ('rejected','Rejected'),
    ]
    status = models.CharField(max_length=20,choices=status_choices,default='pending')
    is_approved = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(null=True,blank=True)
    is_sent_to_doctor = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Result for {self.lab_request.test_type}.Patient: {self.lab_request.patient.user.username}"