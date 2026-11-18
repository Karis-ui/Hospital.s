from pathlib import Path
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory

from accounts.models import CustomUser
from accounts.api import DoctorRegistrationAPIView
from core.models import Doctor


class DoctorRegistrationTests(TestCase):
    def test_registration_accepts_full_name_and_defers_admin_fields(self):
        request = APIRequestFactory().post(
            '/api/accounts/doctor/register/',
            {
                'email': 'doctor@example.com',
                'password': 'StrongPassword123',
                'confirm_password': 'StrongPassword123',
                'full_name': 'Charles Kariuki',
                'phone': '0727537684',
                'specialization': 'Neurology',
                'license_number': 'KMPDC-78734874',
                'resume': SimpleUploadedFile('resume.pdf', b'%PDF-1.4 test'),
            },
            format='multipart',
        )
        with patch.object(DoctorRegistrationAPIView, 'throttle_classes', []):
            response = DoctorRegistrationAPIView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email='doctor@example.com')
        doctor = Doctor.objects.get(user=user)
        self.assertEqual(doctor.full_name, 'Charles Kariuki')
        self.assertEqual(doctor.speciality, 'Neurology')
        self.assertEqual(doctor.phone_number, '0727537684')
        self.assertEqual(doctor.gender, '')
        self.assertEqual(doctor.department, '')
        self.assertEqual(doctor.qualifications, '')
        self.assertFalse(user.is_approved)
        self.addCleanup(Path(doctor.resume.path).unlink, missing_ok=True)
