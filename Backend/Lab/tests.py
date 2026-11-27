from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase


class LabTechnicianReadApiTests(APITestCase):
    def setUp(self):
        self.lab_user = get_user_model().objects.create_user(
            username='lab-tech-test',
            email='lab-tech-test@example.com',
            password='test-password',
            phone='1234567890',
            user_type='lab_technician',
        )

    def test_lab_technician_can_read_empty_lab_endpoints(self):
        self.client.force_authenticate(user=self.lab_user)
        endpoint_names = (
            'lab_dashboard',
            'lab_request_list',
            'lab_report_list',
            'lab_stats',
            'profile',
        )

        for endpoint_name in endpoint_names:
            with self.subTest(endpoint=endpoint_name):
                response = self.client.get(reverse(endpoint_name))
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['status'], 'success')

        self.assertEqual(
            self.client.get(reverse('lab_dashboard')).data['data']['testQueue'],
            [],
        )
        self.assertEqual(
            self.client.get(reverse('lab_dashboard')).data['data']['criticalResults'],
            [],
        )
        self.assertEqual(
            self.client.get(reverse('lab_request_list')).data['requests'],
            [],
        )
        self.assertEqual(
            self.client.get(reverse('lab_report_list')).data['data'],
            [],
        )
        self.assertIsNone(self.client.get(reverse('profile')).data['data'])
        self.assertEqual(
            self.client.get(reverse('lab_stats')).data['data']['test_type_stats'],
            [],
        )

    def test_lab_read_endpoints_still_require_authentication_and_lab_role(self):
        dashboard_url = reverse('lab_dashboard')
        self.assertEqual(self.client.get(dashboard_url).status_code, 401)

        other_user = get_user_model().objects.create_user(
            username='patient-test',
            email='patient-test@example.com',
            password='test-password',
            phone='1234567891',
            user_type='patient',
        )
        self.client.force_authenticate(user=other_user)
        self.assertEqual(self.client.get(dashboard_url).status_code, 403)

    def test_lab_request_list_paginates_without_string_arithmetic(self):
        self.client.force_authenticate(user=self.lab_user)
        response = self.client.get(
            reverse('lab_request_list'),
            {'page': '2', 'page_size': '5'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['pagination']['page'], 2)
        self.assertEqual(response.data['pagination']['page_size'], 5)
