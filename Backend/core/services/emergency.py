from django.conf import settings
from django.db import models
from django.http import HttpResponseForbidden, request
from accounts.models import CustomUser
from django.utils import timezone
from django.shortcuts import render

class Emergency(models.Model):
    is_emergency = models.BooleanField(default=False)
    emergency_reason = models.TextField(null=True, blank=True)
    emergency_authorized_by = models.ForeignKey(CustomUser, null=True, on_delete=models.CASCADE,related_name='emergency_authorized')
    emergency_at = models.DateTimeField(null=True, blank=True)

    reviewed = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(CustomUser, null=True, on_delete=models.CASCADE,related_name='reviewed')


