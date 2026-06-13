from rest_framework.decorators import api_view
from rest_framework.response import Response
from accounts.models import CustomUser
from core.models import Bill
from django.db.models import Sum

def admin_only(request):
    return request.user.is_authenticated and request.user.user_type == 'admin'