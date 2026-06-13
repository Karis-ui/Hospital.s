from rest_framework.permissions import BasePermission

class IsPatient(BasePermission):
    def has_permission(self,request,view):
        return request.user.user_type == 'patient'

class IsLabTechnician(BasePermission):
    def has_permission(self,request,view):
        return request.user.user_type == 'labtechnician'

class IsAdmin(BasePermission):
    def has_permission(self,request,view):
        return request.user.user_type == 'admin'
    
class IsOperator(BasePermission):
    def has_permission(self,request,view):
        return request.user.user_type == 'operator'

class IsDoctor(BasePermission):
    def has_permission(self,request,view):
        return request.user.user_type == 'doctor'

class CreateEmergency(BasePermission):
    def has_permission(self,request,view):
        request.user.is_authenticated and request.user.user_type in[
            'admin','doctor','patient','operator'
        ]