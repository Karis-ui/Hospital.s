from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase
from core.models import Doctor


User = get_user_model()


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'password-reset-tests',
        }
    },
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_HOST_USER='test@example.com',
    EMAIL_HOST_PASSWORD='test-password',
)
class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reset-user',
            email='reset@example.com',
            phone='1234567890',
            password='OldPassword123!',
        )

    def test_forgot_password_sends_reset_email(self):
        response = self.client.post(
            '/api/accounts/forgot-password/',
            {'email': self.user.email},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/reset-password/', mail.outbox[0].body)

    def test_reset_password_updates_password_with_valid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = PasswordResetTokenGenerator().make_token(self.user)

        response = self.client.post(
            '/api/accounts/reset-password/',
            {
                'uid': uid,
                'token': token,
                'new_password': 'NewPassword123!',
                'confirm_password': 'NewPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))

    def test_reset_password_rejects_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            '/api/accounts/reset-password/',
            {
                'uid': uid,
                'token': 'invalid-token',
                'new_password': 'NewPassword123!',
                'confirm_password': 'NewPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'doctor-login-tests',
        }
    },
)
class DoctorLoginTests(APITestCase):
    def test_doctor_login_returns_profile(self):
        user = User.objects.create_user(
            username='doctor-login',
            email='doctor-login@example.com',
            phone='1234567891',
            password='DoctorPassword123!',
            user_type='doctor',
            is_approved=True,
        )
        Doctor.objects.create(
            user=user,
            full_name='Test Doctor',
            email=user.email,
            speciality='Cardiology',
            department='Internal Medicine',
            phone_number='1234567891',
            license_number='LIC-123',
        )

        response = self.client.post(
            '/api/accounts/login/',
            {
                'email': user.email,
                'password': 'DoctorPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['data']['profile']['specialization'],
            'Cardiology',
        )
