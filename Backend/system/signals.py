from .models import SystemSettings

def create_default_settings(sender, **kwargs):
    if not SystemSettings.objects.exists():
        SystemSettings.objects.create(
            working_hours_start='08:00',
            working_hours_end='17:00',
        )