from functools import wraps
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from django.contrib import messages
from .utils import user_has_perm
from .constants import Perms


def permission_required(perm_codename, login_url=None, message=None):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(login_url or 'login')
            
            if user_has_perm(request.user, perm_codename):
                return view_func(request, *args, **kwargs)
            
            if message:
                messages.error(request, message)
            else:
                messages.error(request, f"You need '{perm_codename}' permission to access this page")
            
            return redirect(login_url or 'dashboard')
        return _wrapped_view
    return decorator


def any_permission_required(perm_codenames, login_url=None):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(login_url or 'login')
            
            for perm in perm_codenames:
                if user_has_perm(request.user, perm):
                    return view_func(request, *args, **kwargs)
            
            messages.error(request, f"You need one of these permissions: {', '.join(perm_codenames)}")
            return redirect(login_url or 'dashboard')
        return _wrapped_view
    return decorator