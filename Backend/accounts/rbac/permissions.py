from rest_framework.permissions import BasePermission,IsAuthenticated
from .utils import has_permission

class HasPermission(IsAuthenticated):
    def __init__(self,perm_codename):
        self.perm_codename = perm_codename
    
    def has_permission(self,request,view):
        if not super().has_permission(request,view):
            return False
        return has_permission(request.user,self.perm_codename)

class HasAnyPermission(IsAuthenticated):
    def __init__(self,*perm_codenames):
        self.perm_codenames = perm_codenames
        
    def has_permission(self,request,view):
        if not super().has_permission(request,view):
            return False
        
        for perm in self.perm_codenames:
            if user_has_perm(request.user,perm):
                return True
        
        return False