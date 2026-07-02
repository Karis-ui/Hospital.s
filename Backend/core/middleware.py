from django.http import JsonResponse
from django.core.cache import cache
import re

class RateLimitMiddleware:
    def __init__(self,get_response):
        self.get_response = get_response
        self.limts = {
            r'^/api/accounts/login/':('10','m'),
            r'^/api/accounts/admin/login/':('5','m'),
            r'^/api/accounts/signup/':('5','m'),
            r'^/api/accounts/doctor/register/':('5','m'),
            r'^/api/accounts/lab/register/':('5','m'),
            r'^/api/accounts/operator/register/':('5','m'),
            r'^/api/accounts/admin/register/':('10','m'),
            r'^/api/accounts/refresh_token/':('20','m'),
            r'^/api/.*':('1000','d')
        }
    def __call__(self,request):
        if request.method != 'POST':
            return self.get_response(request)
        path = request.path
        client_ip = request.META.get('REMOTE_ADDR','0.0.0.0')

        for pattern,(count,period) in self.limts.items():
            if re.match(pattern,path):
                cahe_key = f'ratelimit_middleware_{pattern}_{client_ip}'
                period_seconds = {'s':1,'m':60,'h':3600,'d':86400}[period]

                current = cache.get(cahe_key,0)
                if current >= int(count):
                    return JsonResponse({
                        'status': 'error',
                        'message': f'Rate limit exceeded. Try again later.',
                        'retry_after': period_seconds
                    }, status=429)
                
                cache.set(cahe_key,current + 1,timeout=period_seconds)
                break
        return self.get_response(request)