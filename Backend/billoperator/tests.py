from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from core.models import Bill, OperatorField, Patient


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

    def test_operator_profile_uses_fields_from_operator_and_user_models(self):
        OperatorField.objects.create(
            user=self.operator,
            full_name='Billing Operator',
            email='billing-profile@example.com',
            department='Billing Department',
            shift_time='Morning',
            phone_number='0712345678',
            license_number='',
        )
        self.client.force_authenticate(user=self.operator)

        response = self.client.get(reverse('get_profile'))
        profile = response.data['data']

        self.assertEqual(response.status_code, 200)
        self.assertEqual(profile['full_name'], 'Billing Operator')
        self.assertEqual(profile['email'], 'billing-profile@example.com')
        self.assertEqual(profile['phone'], '0712345678')
        self.assertEqual(profile['department'], 'Billing Department')
        self.assertEqual(profile['shift_time'], 'Morning')
        self.assertEqual(profile['date_joined'], self.operator.date_joined)
        self.assertTrue(profile['is_active'])
        self.assertNotIn('employee_id', profile)

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

    def test_bill_detail_includes_fields_used_by_payment_form(self):
        patient_user = get_user_model().objects.create_user(
            username='billing-detail-patient',
            email='billing-detail-patient@example.com',
            password='test-password',
            phone='1234567893',
            user_type='patient',
        )
        patient = Patient.objects.create(
            user=patient_user,
            first_name='Detail',
            last_name='Patient',
            gender='Female',
            phone='1234567893',
            email='billing-detail-patient@example.com',
            address='Test address',
        )
        bill = Bill.objects.create(
            patient=patient,
            amount_received=25,
            amount=125,
            notes='Test bill',
        )
        self.client.force_authenticate(user=self.operator)

        response = self.client.get(reverse('bill_detail', kwargs={'bill_id': bill.id}))

        self.assertEqual(response.status_code, 200)
        bill_data = response.data['data']['bill']
        self.assertEqual(bill_data['billNumber'], f'INV-{bill.id}')
        self.assertEqual(bill_data['patientName'], 'Detail Patient')
        self.assertEqual(bill_data['total'], 125)
        self.assertEqual(bill_data['paidAmount'], 25)
        self.assertEqual(bill_data['balance'], 100)

    def test_process_payment_clears_remaining_balance_and_receipt_uses_model_fields(self):
        patient_user = get_user_model().objects.create_user(
            username='billing-payment-patient',
            email='billing-payment-patient@example.com',
            password='test-password',
            phone='1234567894',
            user_type='patient',
        )
        patient = Patient.objects.create(
            user=patient_user,
            first_name='Payment',
            last_name='Patient',
            gender='Female',
            phone='1234567894',
            email='billing-payment-patient@example.com',
            address='Test address',
        )
        bill = Bill.objects.create(
            patient=patient,
            amount_received=25,
            amount=125,
            notes='Test bill',
        )
        self.client.force_authenticate(user=self.operator)

        payment_response = self.client.post(
            reverse('process_payment', kwargs={'bill_id': bill.id}),
            {'amount_received': 100, 'payment_method': 'Cash'},
            format='json',
        )
        bill.refresh_from_db()

        self.assertEqual(payment_response.status_code, 200, payment_response.data)
        self.assertEqual(bill.payment_status, 'Cleared')
        self.assertEqual(bill.amount_received, 125)
        self.assertTrue(bill.is_paid)

        receipt_response = self.client.get(
            reverse('view_receipt', kwargs={'bill_id': bill.id})
        )
        self.assertEqual(receipt_response.status_code, 200)
        self.assertEqual(receipt_response.data['data']['bill_id'], bill.id)
        self.assertEqual(receipt_response.data['data']['patient_name'], 'Payment Patient')
        self.assertEqual(receipt_response.data['data']['processed_by'], 'Not recorded')

        pdf_response = self.client.get(
            reverse('print_receipt', kwargs={'bill_id': bill.id})
        )
        self.assertEqual(pdf_response.status_code, 200)
        self.assertEqual(pdf_response['Content-Type'], 'application/pdf')
        self.assertTrue(pdf_response.content.startswith(b'%PDF'))
