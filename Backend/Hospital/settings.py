
import dj_database_url
from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
import warnings



# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "PsW7TDUv322R7SHW4kK6JpEyy8k3BTU7cT9x3Kc39KMDhHV6zjOzU0hpkRgkFC02fms"
if not SECRET_KEY:
    SECRET_KEY = 'development-secret-key-do-not-use-in-production'
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False


DEBUG = True
SECURE_HSTS_SECONDS = 31536000 
RAILWAY_DOMAIN = os.environ.get('RAILWAY_STATIC_URL', '').replace('https://', '')
ALLOWED_HOSTS = ['localhost','127.0.0.1','.railway.app','hospitals-production.up.railway.app','smartcare.up.railway.app']
SECURE_HSTS_INCLUDE_SUBDOMAINS =True
SECURE_HSTS_PRELOAD = True


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'core',
    'accounts',
    'patients',
    'doctors',
    'system',
    'Lab',
    'rest_framework',
    #'django_ratelimit',
]

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),      # 15 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),         # 1 day
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    'JTI_CLAIM': 'jti',
    
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=30),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

#RATELIMIT_ENABLE = True
#RATELIMIT_USE_CACHE = 'default'
#RATELIMIT_VIEW = 'core.views.rate_limit_exceeded'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES':[
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES':[
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [],
    'DEFAULT_THROTTLE_RATES': {
        'login': '10/hour',
        'register': '7/hour',
        'admin_login': '10/hour',
        'password_reset': '5/hour',
    },
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Hospital.urls'
CORS_ALLOWED_ORIGINS = [
    'https://smartcare.up.railway.app',
    'https://hospitals-production.up.railway.app'
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CSRF_TRUSTED_ORIGINS = [
    "https://hospitals-production.up.railway.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_COOKIE_SECURE = True 
CSRF_COOKIE_HTTPONLY = False  
CSRF_USE_SESSIONS = False
CSRF_COOKIE_SAMESITE = 'Lax'

REDIS_URL = os.environ.get('REDIS_URL')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'smartcare',
    }
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR /'core'/ 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
                'django.template.context_processors.static',
            ],
        },
    },
]

WSGI_APPLICATION = 'Hospital.wsgi.application'

DATABASE_URL= os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default':dj_database_url.config(
            default=DATABASE_URL,conn_max_age=600,conn_health_checks=True
        )
    }
    print("Using POSTGRESQL!!!!!!!!!!!!")
else:
    DATABASES = {
        'default':{
            'ENGINE':'django.db.backends.sqlite3',
            'NAME':BASE_DIR / 'db.sqlite3',
        }
    }
    print('Using SQLITE3')



# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_ROOT = os.path.join(BASE_DIR,'staticfiles')
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
LOGIN_REDIRECT_URL = 'book-appointment'
LOGOUT_REDIRECT_URL = 'login'

AUTH_USER_MODEL = 'accounts.CustomUser'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = 'example@gmail.com'
EMAIL_HOST_PASSWORD = 'examplepassowrd'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMERGENCY_CONTACT = 'phone'


MEDIA_URL='/media/'
MEDIA_ROOT=BASE_DIR = os.path.join(BASE_DIR,'media')
