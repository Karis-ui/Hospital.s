from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
    
class Module(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order','name']
    def __str__(self):
        return self.name
    
class Permission(models.Model):
    module = models.ForeignKey(Module,on_delete=models.CASCADE,related_name='permissions')
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['module','name']
    def __str__(self):
        return self.codename
    
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self',on_delete=models.SET_NULL,null=True,blank=True,related_name='child_roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_all_permissions(self):
        if self.parent:
            return self.permissions.all() | self.parent.get_all_permissions()
        return self.permissions.all()
    
class UserRole(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='role_assignments')
    role = models.ForeignKey(Role,on_delete=models.CASCADE,related_name='user_assignments')
    assigned_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='assigned_roles')
    
    valid_from = models.DateTimeField(default=timezone.now)
    valid_till = models.DateTimeField(null=True,blank=True)
    is_active = models.BooleanField(default=True)
    
    assigned_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True,blank=True)
    revoked_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='revoked_roles')
    
    class Meta:
        unique_together = ('user', 'role', 'valid_from')
    def __str__(self):
        return f'{self.user.username} - {self.role.name}'
    def is_valid(self):
        now = timezone.now()
        
        if not self.is_active:
            return False
        if self.valid_from and self.valid_from > now:
            return False
        if self.valid_till and self.valid_till < now:
            return False
        return True
    
class PermissionOverride(models.Model):
    GRANT = 'grant'
    DENY = 'deny'
    ACTION_CHOICES = [(GRANT,'Grant'),(DENY,'Deny')]
    
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='permission_overrides')
    permission = models.ForeignKey(Permission,on_delete=models.CASCADE)
    action = models.CharField(max_length=10,choices=ACTION_CHOICES,default=GRANT)
    
    valid_till = models.DateTimeField(null=True,blank=True)
    reason = models.TextField(blank=True)
    granted_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='granted_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique = ['user','permission']
    
    def __str__(self):
        return f'{self.user.username} - {self.action} - {self.permission.codename}'
