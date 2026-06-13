from django.db import models
from core.models import Doctor


class DoctorSchedule(models.Model):
    doctor = models.OneToOneField(Doctor, on_delete=models.CASCADE)
    
    working_hours_start = models.TimeField()
    working_hours_end = models.TimeField()
    
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    
    leave_dates = models.JSONField(default=list, blank=True)