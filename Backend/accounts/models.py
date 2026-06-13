from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self,email,password,**extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,email,password=None,**extra_fields):
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        extra_fields.setdefault('user_type','admin')

        if extra_fields.get('is_staff')is False:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser')is False:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email,password,**extra_fields)

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES =(
        ('admin','Admin'),
        ('doctor','Doctor'),
        ('patient','Patient'),
        ('operator','Billing Operator'),
        ('lab_technician','Lab Technician'),
    )
    username = models.CharField(max_length=30, unique=True, editable=False)
    password = models.CharField(max_length=100)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES,default='patient')
    is_approved = models.BooleanField(default=True)
    phone = models.CharField(max_length=11,null=False,blank=False)
    email = models.EmailField(null=False,blank=False,unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True,blank=True)
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username','phone']

    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
    def has_legacy_permission(self):
        type_permission = {
            'admin':['*'],
            'doctor':['appointment.manage','plab.request','prescription.manage','report.view'],
            'patient':['appointment.view','bill.view','report.view'],
            'operator':['billing.manage','billing.view'],
            'lab_technician':['lab.process','report.add','report.change']
        }

        perms = type_permission.get(self.user_type,[])
        return '*' in perms or any(perm in perms for perm in self.get_all_permissions())
 