from datetime import datetime, timedelta
from core.models import Appointment


def generate_slots(schedule,date,duration=30):
    slots = []
    current = datetime.combine(date,schedule.working_hours_start)
    end = datetime.combine(date,schedule.working_hours_end)
    while current + timedelta(minutes=duration) <= end:
        slots.append(current.time())
        current += timedelta(minutes=duration)
    return slots

def validate_slot(doctor, date, time):
    pass
