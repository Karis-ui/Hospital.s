from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from core.models import Bill, Patient


class OperatorReadApiTests(APITestCase):
    def setUp(self):
        self.operator = get_user_model().objects.create_user(
            username='billing-operator-test',
            email='billing-operator-test@example.com',
            password='test-password',
            phone='1234567890',
            user_type='operator',
        )

    def test_operator_read_endpoints_return_empty_success_payloads(self):
        self.client.force_authenticate(user=self.operator)
        endpoints = (
            'billing_dashboard',
            'bill_list',
            'billing_analytics',
            'transaction_list',
            'get_profile',
        )

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(reverse(endpoint))
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['status'], 'success')

        dashboard = self.client.get(reverse('billing_dashboard')).data['data']
        self.assertEqual(dashboard['recent_transactions'], [])
        self.assertEqual(dashboard['statistics']['pendingBills'], 0)

        bills = self.client.get(reverse('bill_list')).data['data']
        self.assertEqual(bills['bills'], [])
        self.assertEqual(bills['pagination']['total_items'], 0)

        transactions = self.client.get(reverse('transaction_list')).data['data']
        self.assertEqual(transactions['transactions'], [])

        analytics = self.client.get(reverse('billing_analytics')).data['data']
        self.assertEqual(analytics['summary']['totalBills'], 0)
        self.assertIsNone(self.client.get(reverse('get_profile')).data['data'])
        self.assertEqual(
            self.client.get(reverse('billing_export')).status_code,
            200,
        )
        self.assertEqual(
            self.client.get(reverse('transaction_export')).status_code,
            200,
        )

    def test_operator_endpoints_still_require_operator_authentication(self):
        dashboard_url = reverse('billing_dashboard')
        self.assertEqual(self.client.get(dashboard_url).status_code, 401)

        patient = get_user_model().objects.create_user(
            username='billing-patient-test',
            email='billing-patient-test@example.com',
            password='test-password',
            phone='1234567891',
            user_type='patient',
        )
        self.client.force_authenticate(user=patient)
        self.assertEqual(self.client.get(dashboard_url).status_code, 403)

    def test_operator_read_endpoints_return_actual_bill_data(self):
        patient_user = get_user_model().objects.create_user(
            username='billing-patient-data',
            email='billing-patient-data@example.com',
            password='test-password',
            phone='1234567892',
            user_type='patient',
        )
        patient = Patient.objects.create(
            user=patient_user,
            first_name='Billing',
            last_name='Test',
            gender='Female',
            phone='1234567892',
            email='billing-patient-data@example.com',
            address='Test address',
        )
        Bill.objects.create(
            patient=patient,
            amount_received=0,
            amount=125,
            notes='Test bill',
        )
        self.client.force_authenticate(user=self.operator)

        dashboard = self.client.get(reverse('billing_dashboard')).data['data']
        self.assertEqual(dashboard['statistics']['pendingBills'], 1)
        self.assertEqual(dashboard['recent_transactions'][0]['patient'], 'Billing Test')

        bills = self.client.get(reverse('bill_list')).data['data']['bills']
        self.assertEqual(bills[0]['patientName'], 'Billing Test')
        self.assertEqual(bills[0]['status'], 'Pending')

        analytics = self.client.get(reverse('billing_analytics')).data['data']
        self.assertEqual(analytics['summary']['totalBills'], 1)
