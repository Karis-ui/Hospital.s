from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from core.models import Doctor


User = get_user_model()


@override_settings(
    CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'doctor-api-tests',
        }
    },
)
class DoctorEmptyDataApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='empty-doctor',
            email='empty-doctor@example.com',
            phone='1234567890',
            password='DoctorPassword123!',
            user_type='doctor',
        )
        self.client.force_authenticate(self.user)

    def test_read_endpoints_return_empty_success_when_doctor_profile_is_missing(self):
        endpoints = [
            '/api/doctors/dashboard/',
            '/api/doctors/get/profile/',
            '/api/doctors/my/patients/',
            '/api/doctors/statistics/',
            '/api/doctors/prescriptions/',
            '/api/doctors/reports/',
            '/api/doctors/lab/requests/',
            '/api/doctors/search/',
            '/api/doctors/view/',
            '/api/doctors/patient/detail/99999/',
            '/api/doctors/appointment/99999/view/',
            '/api/doctors/get/99999/medical-records/',
            '/api/doctors/get/99999/vital-views/',
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 200)

    def test_dashboard_returns_zero_counts_for_doctor_without_records(self):
        Doctor.objects.create(
            user=self.user,
            full_name='Test Doctor',
            email=self.user.email,
            speciality='General Medicine',
            department='Outpatient',
            phone_number='1234567890',
            license_number='DOC-TEST-1',
        )

        response = self.client.get('/api/doctors/dashboard/')

        self.assertEqual(response.status_code, 200)
        data = response.data['data']
        self.assertEqual(data['statistics']['today_appointments'], 0)
        self.assertEqual(data['statistics']['total_patients'], 0)
        self.assertEqual(data['appointments']['today'], [])
        self.assertEqual(data['patients']['recent'], [])

    def test_dashboard_keeps_authentication_and_role_errors(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(
            self.client.get('/api/doctors/dashboard/').status_code,
            401,
        )

        patient_user = User.objects.create_user(
            username='not-a-doctor',
            email='not-a-doctor@example.com',
            phone='1234567891',
            password='PatientPassword123!',
            user_type='patient',
        )
        self.client.force_authenticate(patient_user)
        self.assertEqual(
            self.client.get('/api/doctors/dashboard/').status_code,
            403,
        )
