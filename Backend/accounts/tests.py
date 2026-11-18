from pathlib import Path
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory

from accounts.models import CustomUser
from accounts.api import DoctorRegistrationAPIView, LabTechnRegistrationAPIView, OperatorRegistrationAPIView
from core.models import Doctor, OperatorField
from Lab.models import LabTech


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


class LabTechnicianRegistrationTests(TestCase):
    def test_registration_creates_pending_lab_technician_from_form_fields(self):
        request = APIRequestFactory().post(
            '/api/accounts/lab/register/',
            {
                'username': 'lab.charles',
                'email': 'lab.charles@example.com',
                'password': 'StrongPassword123',
                'confirm_password': 'StrongPassword123',
                'full_name': 'Charles Kariuki',
                'phone_number': '0727537684',
                'gender': 'Male',
                'license_number': 'KMLTTB-12345',
                'department': 'Hematology',
                'shift_time': 'Morning',
                'experience_years': '3',
                'resume': SimpleUploadedFile('lab-resume.pdf', b'%PDF-1.4 test'),
            },
            format='multipart',
        )
        with patch.object(LabTechnRegistrationAPIView, 'throttle_classes', []):
            response = LabTechnRegistrationAPIView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email='lab.charles@example.com')
        lab_tech = LabTech.objects.get(user=user)
        self.assertEqual(user.username, 'lab.charles')
        self.assertEqual(user.phone, '0727537684')
        self.assertFalse(user.is_approved)
        self.assertEqual(lab_tech.full_name, 'Charles Kariuki')
        self.assertEqual(lab_tech.gender, 'Male')
        self.assertIsNone(lab_tech.date_of_birth)
        self.assertEqual(lab_tech.qualifications, '')
        self.assertEqual(lab_tech.department, 'Hematology')
        self.assertEqual(lab_tech.shift_time, 'Morning')
        self.assertEqual(lab_tech.experience_years, 3)
        self.addCleanup(Path(lab_tech.resume.path).unlink, missing_ok=True)


class OperatorRegistrationTests(TestCase):
    def test_registration_creates_pending_operator_profile(self):
        request = APIRequestFactory().post(
            '/api/accounts/operator/register/',
            {
                'username': 'operator.alex',
                'email': 'operator.alex@example.com',
                'password': 'StrongPassword123',
                'confirm_password': 'StrongPassword123',
                'full_name': 'Alex Operator',
                'phone': '0712345678',
                'department': 'Billing',
                'shift_time': 'Morning',
                'qualification': 'Accounting certificate',
            },
            format='multipart',
        )
        with patch.object(OperatorRegistrationAPIView, 'throttle_classes', []):
            response = OperatorRegistrationAPIView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email='operator.alex@example.com')
        operator = OperatorField.objects.get(user=user)
        self.assertEqual(user.username, 'operator.alex')
        self.assertEqual(user.phone, '0712345678')
        self.assertFalse(user.is_approved)
        self.assertEqual(operator.full_name, 'Alex Operator')
        self.assertEqual(operator.email, 'operator.alex@example.com')
        self.assertEqual(operator.department, 'Billing')
        self.assertEqual(operator.shift_time, 'Morning')
        self.assertEqual(operator.phone_number, '0712345678')
        self.assertEqual(operator.qualification, 'Accounting certificate')
