from django.core.cache import cache
from django.utils import timezone
from accounts.rbac.models_rabc import Permission,UserRole,PermissionOverride

def get_user_permission(user,force_refresh=False):
    if not user.is_authenticated:
        return set()
    
    cache_key = f'user_permissions_{user.id}'
    if not force_refresh:
        cached = cache.get(cache_key)
        
        permissions = set()
        role_assignments = UserRole.objects.filter(user=user,is_active=True,valid_from__lte=timezone.now()).filter(models.Q(valid_till__isnull=True) | models.Q(valid_till__gte=timezone.now())).select_related('role')
        
    for assignment in role_assignments:
        role = assignment.role
        role_permissions = role.get_all_permissions()
        permissions.update(role_permissions.values_list('codename',flat=True))
    
    overrides = PermissionOverride.objects.filter(user=user).filter(models.Q(valid_till__isnull=True) | models.Q(valid_till__gt=timezone.now())).select_related('permission')
    
    for override in overrides:
        if override.action == 'grant':
            permissions.add(override.permission.codename)
        elif override.action == 'deny' and override.permission.codename in permissions:
            permissions.remove(override.permission.codename)
    
    cache.set(cache_key, permissions, timeout=300)  
    return permissions

def has_permission(user,perm_codename):
    if not user or not user.is_authenticated:
        return False
    
    if user.is_superuser:
        return True
    
    permissions = get_user_permission(user)
    return perm_codename in permissions

def migrate_to_rbac(user):
    from models_rabc import Role
    
    role_map = {
        'admin': ['Administrator'],
        'doctor': ['Doctor'],
        'patient': ['Patient'],
        'operator': ['Billing Operator'],
        'lab_tech': ['Lab Technician'],
    }
    
    role_codes = role_map.get(user.user_type, [])
    for rolle_code in role_codes:
        try:
            role = Role.objects.get(code=role_codes)
            UserRole.objects.get_or_create(user=user,role=role,defaults={'assigned_by':None,'valid_from':timezone.now()})
        except Role.DoesNotExist:
            pass
    
    user._rbac_migrated = True
    user.save(update_fields=['_rbac_migrated'])
    return True