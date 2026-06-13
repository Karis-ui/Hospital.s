from datetime import datetime,timedelta
from django.utils import timezone
from system.utils import get_system_settings
from core.models import Appointment

def slot_available(doctor,patient,date,time):
    settings = get_system_settings()

    start = datetime.combine(date,time)
    end = start + timedelta(minutes=settings.appointment_duration)
    if start < timezone.now():
        return False,"Error! Try again"

    if not (settings.working_hours_start <= time <= settings.working_hours_end):
        return False,"Error! Try again"

    if not doctor.available:
        return False,"Doctor is unavailable"

    doctor_conflict = Appointment.objects.filter(doctor=doctor,appointment_date=date,appointment_time__Lt=end.time(),appointment_time__gte=start.time(),status="Pending").exists()
    if doctor_conflict:
        return False,"Doctor is already has another appointment on this slot."

    patient_conflict = Appointment.objects.filter(patient=patient,appointment_date=date,appointment_time__Lt=end.time(),appointment_time__gte=start.time(),status='Pending').exists()
    if patient_conflict:
        return False,"Patient is already has another appointment on this slot."

    return True,None