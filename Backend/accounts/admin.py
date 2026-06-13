from django.contrib import admin
from core.models import CustomUser,Patient,Doctor,OperatorField

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email','user_type','is_active','is_staff')
    list_filter = ('user_type','is_active','is_staff')
    search_fields = ('email','user_type')
    ordering = ('email',)

@admin.register(Doctor)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user','speciality','phone_number','email')
    list_filter = ('speciality','email')
    search_fields = ('user','email','speciality')
    ordering = ('user',)

@admin.register(OperatorField)
class OperatorFieldAdmin(admin.ModelAdmin):
    list_display = ('phone_number','department','user')
    search_fields = ('user','department')
    ordering = ('user',)