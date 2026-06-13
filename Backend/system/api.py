from django.db import models
from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from.models import SystemSettings

def is_admin(user):
    return user.is_authenticated and user.user_type == 'admin'

@user_passes_test(is_admin)
def settings_view(request):
    settings = SystemSettings.objects.first()

    if request.method == 'POST':
        working_hours_start = models.TimeField(default="08:00")
        working_hours_end = models.TimeField(default="17:00")
        appointment_duration = models.PositiveIntegerField(default=30)
        timezone = models.CharField(max_length=10, default="UTC")
        weekend_appointment = models.BooleanField(default=False)

        updated_at = models.DateTimeField(auto_now=True)

        for field in settings._meta.fields:
            name = field.name
            if name in request.post:
                value = request.post.get(name)
                if isinstance(field,(models.BooleanField,)):
                    setattr(settings,name,True if value == 'on' else False)
                else:
                    setattr(settings,name,value)
        settings.save()
        messages.success(request, 'Settings updated successfully.')
        return redirect('settings')

    return render(request,'Admin/settings.html',{'settings':settings})


