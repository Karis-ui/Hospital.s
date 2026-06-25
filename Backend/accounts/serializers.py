from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from core.models import Patient,Doctor,OperatorField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class SignUp(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirmPassword = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username','email','first_name','last_name','email','gender','phone','address','password']
        extra_kwargs = {
            'email':{'required':True},
        }
        def create(self,validated_data):
            user = User.objects.create_user(
                username = validated_data['username'],
                first_name = validated_data['first_name'],
                last_name = validated_data['last_name'],
                email = validated_data['email'],
                gender = validated_data['gender'],
                phone = validated_data['phone'],
                address = validated_data['address'],
                password = validated_data['password']
            )
            if user.user_type == 'patient':
                Patient.objects.create(user=user)
            return user
        
class LoginSerializer(serializers.Serializer):
    email_or_username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,write_only=True)
    def validate(self,data):
        user = authenticate(username=data['email'],password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')

        return{
            'user':user,
            'access':str(RefreshToken.for_user(user).access_token),
            'refresh':str(RefreshToken.for_user(user))
        }

class ChangePasswordSerializer(serializers.Serializer):
    old = serializers.CharField(required=True,write_only=True)
    new = serializers.CharField(required=True,write_only=True,validators=[validate_password])
    confirm = serializers.CharField(required=True,write_only=True)
    
    def validate(self,data):
        if data['new'] != data['confirm']:
            raise serializers.ValidationError('New Passwords do not match!')
        return data

class ForgotPassword(serializers.Serializer):
    email = serializers.EmailField(required=True)

class UserProfile(serializers.Serializer):
    user = serializers.CharField(source='get_full_name',read_only=True)
    profile = serializers.DictField()
    permissions = serializers.DictField()
    statistics = serializers.DictField()