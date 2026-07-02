from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django_ratelimit.decorators import ratelimit
from rest_framework.response import Response
from rest_framework import status

def rate_limit(key='ip',rate='5/m',method='POST',block=True):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request,*args,**kwargs):
            if key == 'user' and request.user.is_authenticated:
                key_value = request.user.id
            elif key == 'ip':
                key_value = request.META.get('REMOTE_ADDR','0.0.0.0')
            else:
                key_value = request.META.get('REMOTE_ADDR','0.0.0.0')
            
            count,period = rate.split('/')
            count = int(count)
            period_seconds = {'s':1,'m':60,'h':3600,'d':86400}[period]

            cache_key = f'ratelimit_{view_func.__name__}_{key_value}_{method}'
            current = cache.get(cache_key,0)
            if current >= count:
                if block:
                    return JsonResponse({
                        'status':'error',
                        'message':f'Rate limit exceeded. Please try again later',
                        'retry_after':period_seconds,
                        'limit':count,
                        'period':period
                    },status=status.HTTP_429_TOO_MANY_REQUESTS)
                else:
                    response = view_func(request,*args,**kwargs)
                    response['X-RateLimit-Limit'] = str(count)
                    response['X-RateLimit-Remaining'] = '0'
                    return response
            
            cache.set(cache_key,current + 1,timeout=period_seconds)
            response = view_func(request,*args,**kwargs)

            if hasattr(response,'__setitem__'):
                response['X-RateLimit-Limit'] = str(count)
                response['X-RateLimit-Remaining'] = str(count - current -1)
                response['X-RateLimit-Reset'] = str(int(cache.ttl(cache_key) or 0))
            return response
        return wrapper
    return decorator

def rate_limit_exceeded(request,exception):
    return JsonResponse({
        'status':'error',
        'message':'Too many requests. Please slow down',
        'retry_after':60
    },status=status.HTTP_429_TOO_MANY_REQUESTS)