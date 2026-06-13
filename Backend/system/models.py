from django.db import models

class SystemSettings(models.Model):
    timezone = models.CharField(max_length=50,default='UTC')
    working_hours_start = models.TimeField(null=True,blank=True,default='08.00')
    working_hours_end = models.TimeField(null=True,blank=True,default='18.00')
    appointment_duration = models.IntegerField(default=60)
    login_identifier = models.CharField(
        max_length=100,
        choices=[('email','Email'),('phone','Phone')],
        default='email'
    )
    session_timer = models.IntegerField(null=True,blank=True,default=30)
    factor_auth = models.BooleanField(default=False)
    password_expiry = models.PositiveIntegerField(blank=True,null=True,default=120)
    max_failed_logins = models.PositiveIntegerField(null=True,blank=True,default=3)
    encryption = 'TLS'
    email_enabled = models.BooleanField(default=True)
    notify_on_appointment = models.BooleanField(default=True)
    notify_on_bill = models.BooleanField(default=True)
    notify_on_report = models.BooleanField(default=True)
    doctor_requires_approval = models.BooleanField(default=True)
    operator_requires_approval = models.BooleanField(default=True)
    theme = models.CharField(
        max_length=100,
        choices=[('light','Light'),('dark','Dark'),('hospital','Hospital Blue')],
        default='hospital'
    )
    primary_color = models.CharField(max_length=100,default='#0d6efd')
    sidebar_collapsible = models.BooleanField(default=True)
    report_confidentiality = models.BooleanField(default=False)
    activity_logging = models.BooleanField(default=False)
    data_retention_days = models.PositiveIntegerField(null=True,default=365)
    updated_at = models.DateTimeField(auto_now=True)
    
    site_name = models.CharField(max_length=100,default='Hospital Management System')
    site_logo = models.ImageField(upload_to='logos/',null=True,blank=True)
    favicon = models.ImageField(upload_to='favicons/',null=True,blank=True)
    email_host = models.CharField(max_length=100,default='smtp.email.com')
    email_port = models.PositiveIntegerField(default=587)
    email_host_user = models.CharField(max_length=100,default='noreply@hospital.com')
    email_host_password = models.CharField(max_length=100,default='')
    email_use_tls = models.BooleanField(default=True)
    email_use_ssl = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    sms_provider = models.CharField(max_length=100,default='Twilio')
    sms_api_key = models.CharField(max_length=255,default='',blank=True)
    twilio_account_sid = models.CharField(max_length=255,default='',blank=True)
    twilio_auth_token = models.CharField(max_length=255,default='',blank=True)

    def __str__(self):
        return 'System Settings'
    class Meta:
        verbose_name_plural = 'System Settings'