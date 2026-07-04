# backend/core/throttles.py
from rest_framework.throttling import SimpleRateThrottle

class LoginRateThrottle(SimpleRateThrottle):
    scope = 'login'
    rate = '10/hour'  

class RegistrationRateThrottle(SimpleRateThrottle):
    scope = 'register'
    rate = '7/hour'   

class AdminLoginRateThrottle(SimpleRateThrottle):
    scope = 'admin_login'
    rate = '10/hour'  

class PasswordResetRateThrottle(SimpleRateThrottle):
    scope = 'password_reset'
    rate = '5/hour'   