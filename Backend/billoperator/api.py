from django.core.exceptions import PermissionDenied
from django.core.files.uploadhandler import load_handler
from django.core.paginator import Paginator,EmptyPage,PageNotAnInteger
from django.shortcuts import get_object_or_404
from django.utils import (timezone)
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from core.models import Patient,Bill,OperatorField
from datetime import timedelta
import calendar
from django.db.models import Count, Sum
import os
from io import BytesIO
from django.http import HttpResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image,Table,TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter
from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from core.util.email_service import send_email,EmailMessage
from core.util.pdf_generator import generate_pdf
from system.utils import get_system_settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Hospital.Api.permissions import IsOperator
from Hospital.Api.serializers import  OperatorSerializer,BillSerializer,PatientSerializer
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

class OperatorDashboardAPIView(APIView):
    permission_classes = [IsOperator]
    def get(self, request):
        try:
            operator = OperatorField.objects.get(user=request.user)
            total_bills = Bill.objects.count()
            pending_bills = Bill.objects.filter(payment_status='Pending').count()
            cleared_bills = Bill.objects.filter(payment_status='Cleared').count()
            cancelled_bills = Bill.objects.filter(payment_status='Cancelled').count()
            
            today = timezone.now().date()
            today_revenue = Bill.objects.filter(
                created_at__date=today, 
                payment_status='Cleared'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            today_bills = Bill.objects.filter(created_at__date=today).count()
            recent_bills = Bill.objects.select_related(
                'patient', 'doctor'
            ).order_by('-created_at')[:10]
            last_7_days = []
            revenue_data = []
            for i in range(6, -1, -1):
                date = today - timedelta(days=i)
                revenue = Bill.objects.filter(
                    created_at__date=date,
                    payment_status='Cleared'
                ).aggregate(total=Sum('amount'))['total'] or 0
                last_7_days.append(date.strftime('%Y-%m-%d'))
                revenue_data.append(float(revenue))
            
            current_month = today.month
            current_year = today.year
            monthly_revenue = Bill.objects.filter(
                created_at__month=current_month,
                created_at__year=current_year,
                payment_status='Cleared'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            recent_bills_serializer = BillSerializer(
                recent_bills, 
                many=True, 
                context={'request': request}
            )
            operator_serializer = OperatorSerializer(
                operator, 
                context={'request': request}
            )
            
            return Response({
                'status': 'success',
                'data': {
                    'operator': operator_serializer.data,
                    'statistics': {
                        'total_bills': total_bills,
                        'pending_bills': pending_bills,
                        'cleared_bills': cleared_bills,
                        'cancelled_bills': cancelled_bills,
                        'today_bills': today_bills,
                        'today_revenue': today_revenue,
                        'monthly_revenue': monthly_revenue,
                    },
                    'recent_bills': recent_bills_serializer.data,
                    'chart_data': {
                        'labels': last_7_days,
                        'values': revenue_data,
                    },
                    'timestamp': timezone.now().isoformat(),
                }
            }, status=status.HTTP_200_OK)
            
        except OperatorField.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Operator profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class TransactionList(APIView):
    permission_classes = [IsAuthenticated,IsOperator]
    VALID_STATES = ['Pending','Cleared','Overdue']
    VALID_PAYMENT_METHODS = ['Cash','Credit Card','Debit Card','M-Pesa','Cheque']
    
    def get(self, request):
        try:
            bills = Bill.objects.select_related(
                'patient'
            ).order_by('-created_at')
            
            bills = bills.self.apply_filters(bills,request)
            summary = self.calculate_summary(bills)
            paginated_bills,pagination_meta = self.paginate_bills(bills,request)
            serializer = BillSerializer(paginated_bills,many=True,context={'request':request})
            
            return Response({
                'status': 'success',
                'data': {
                    'tranactions': serilaizer.data,
                    'pagination': pagination_meta,
                    'summary': summary
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.erroe(f'Transaction list error: {str(e)}',exc_info=True)
            return Response({
                'status': 'error',
                'message': 'An error occurred while fetching transactions',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def apply_filters(self,queryset,request):
        status_filter = request.query_params.get('status','')
        if status_filter and status_filter in self.VALID_STATES:
            queryset = queryset.filter(payment_status=status_filter)
        elif status_filter:
            logger.warning(f'Invalid status filter: {status_filter}')
            
        payment_method = request.query_params.get('payment_method','')
        if payment_method and payment_method in self.VALID_PAYMENT_METHOD:
            queryset = queryset.filter(payment_method=payment_method)
        elif payment_method:
            logger.warning(f'Invalid Payment Method filter: {payment_method}') 
        
        queryset = self.apply_date_filters(queryset,request)
        queryset = self.apply_search_filters(queryset,request)
        queryset = self.apply_amount_filters(queryset,request)
        return queryset
    
    def apply_date_filters(self,request,queryset):
        date_from = request.query_params.get('date_from','')
        date_to = request.query_params.get('date_to','')
        
        if date_from:
            try:
                date_to_obj = datetime.strptime(date_to,'%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date_from_obj)
            except ValueError:
                logger.warning(f'Invalid date_from format: {date_from}')
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to,'%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date_to_obj)
            except ValueError:
                logger.warning(f'Invalid date_to format: {date_to}')
    
    def apply_search_filters(self,queryset,request):
        search_query = request.query_params.get('search','').strip()
        if search_query:
            if search_query.isdigit():
                queryset = queryset.filter(
                    Q(id__icontains=search_query) |
                    Q(patient__phone__icontains=search_query)
                )
            else:
                queryset = queryset.filter(
                    Q(patient__first_name__icontains=search_query) |
                    Q(patient__last_name__icontains=search_query) |
                    Q(patient__email__icontains=search_query) 
                )
        return queryset
    
    def apply_amount_filters(self,queryset,request):
        min_amount = request.query_params.get('min_amount','')
        max_amount = request.query_params.get('max_amount','')
        
        if min_amount:
            try:
                min_val = Decimal(min_amount)
                if min_val >= 0:
                    queryset = queryset.filter(amount__gte=min_val)
            except (ValueError,TypeError):
                logger.warning(f'Invalid min_amount {min_amount}')
        
        if max_amount:
            try:
                max_val = Decimal(max_amount)
                if max_val >= 0:
                    queryset = queryset.filter(amount__gte=max_val)
            except (ValueError,TypeError):
                logger.warning(f'Invalid max_amount {max_amount}')
        return queryset
    
    def calculate_summary(self,queryset):
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        cleared_amount = queryset.filter(payment_status='Cleared').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        pending_amount = queryset.filter(payment_status='Pending').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        overdue_amount = queryset.filter(payment_status='Overdue').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        return {
            'total_amount': float(total_amount),
            'cleared_amount': float(cleared_amount),
            'pending_amount': float(pending_amount),
            'overdue_amount': float(overdue_amount),
            'total_transactions': queryset.count(),
            'cleared_transactions': queryset.filter(payment_status='Cleared').count(),
            'pending_transactions': queryset.filter(payment_status='Pending').count(),
            'overdue_transactions': queryset.filter(payment_status='Overdue').count(),
        }
        
    def paginate_bills(self,queryset,request):
        page = int(request.query_params.get('page',1))
        page_size = int(request.query_params.get('page_size',20))
        
        paginator = Paginator(queryset,page_size)
        try:
            paginated_bills = paginator.page(page)
            if page_size < 1:
                page_size = 20
            if page_size > 100:
                page_size = 100
                
        except PageNotAnInteger:
            paginated_bills = paginator.page(1)
        except EmptyPage:
            paginated_bills = paginator.page(paginator.num_pages)
        
        pagination_meta = {
            'current_page': paginated_bills.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
            'has_next': paginated_bills.has_next(),
            'has_previous': paginated_bills.has_previous(),
        }
        
        return paginated_bills,pagination_meta

class ExportTransaction(APIView):
    def get(self,request):
        try:
            export_format = request.query_params.get('format','excel')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            query_set = Bill.objects.select_related('patient').order_by('-created_at')
            
            if date_to and date_from:
                try:
                    start_date = datetime.strptime(date_from,'%Y-%m-%d').date()
                    end_date = datetime.strptime(date_to,'%Y-%m-%d').date()
                    query_set = queryset.filter(created_at__date_range=[start_date,end_date])
                except ValueError:
                    pass
            
            if export_format == 'csv':
                return self.export_csv(queryset)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid export format. Supported formats: csv, excel'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'Export transaction error: {str(e)}',exc_info=True)
            return Response({
                'status': 'error',
                'message': 'An error occurred while exporting transactions',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def export_csv(self,queryset):
        import csv
        response = HttpResponse(content_type='text/csv')
        filename = f'transactions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(['Bill ID', 'Patient', 'Amount', 'Payment Status','Payment Method', 'Created At', 'Cleared At','Notes'])
        for bill in queryset:
            writer.writerow([
                bill.id,
                f"{bill.patient.first_name} {bill.patient.last_name}",
                float(bill.amount),
                bill.payment_status,
                bill.payment_method or '',
                bill.created_at.strptime('%Y-%m-%d %H:%M:%S'),
                bill.cleared_at.strptime('%Y-%m-%d %H:%M:%S'),
                bill.notes or '',
            ])
        return response

class BillListAPIView(APIView):
    permission_classes = [IsOperator]
    
    def get(self, request):
        try:
            bills = Bill.objects.select_related(
                'patient', 'doctor'
            ).order_by('-created_at')
            
            status_filter = request.query_params.get('status', '')
            if status_filter:
                bills = bills.filter(payment_status=status_filter)
            
            payment_method = request.query_params.get('payment_method', '')
            if payment_method:
                bills = bills.filter(payment_method=payment_method)
            
            date_from = request.query_params.get('date_from', '')
            date_to = request.query_params.get('date_to', '')
            
            if date_from:
                try:
                    date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                    bills = bills.filter(created_at__date__gte=date_from_obj)
                except ValueError:
                    pass
            
            if date_to:
                try:
                    date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                    bills = bills.filter(created_at__date__lte=date_to_obj)
                except ValueError:
                    pass
                search_query = request.query_params.get('search', '')
            if search_query:
                bills = bills.filter(
                    Q(patient__first_name__icontains=search_query) |
                    Q(patient__last_name__icontains=search_query) |
                    Q(patient__email__icontains=search_query) |
                    Q(patient__phone__icontains=search_query) |
                    Q(id__icontains=search_query)
                )
            
            min_amount = request.query_params.get('min_amount')
            if min_amount:
                bills = bills.filter(amount__gte=min_amount)
            
            max_amount = request.query_params.get('max_amount')
            if max_amount:
                bills = bills.filter(amount__lte=max_amount)
            
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            
            paginator = Paginator(bills, page_size)
            current_page = paginator.get_page(page)
            total_sum = bills.aggregate(total=Sum('amount'))['total'] or 0
            cleared_sum = bills.filter(payment_status='Cleared').aggregate(
                total=Sum('amount')
            )['total'] or 0
            pending_sum = bills.filter(payment_status='Pending').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            serializer = BillSerializer(
                current_page, 
                many=True, 
                context={'request': request}
            )
            
            return Response({
                'status': 'success',
                'data': {
                    'bills': serializer.data,
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_pages': paginator.num_pages,
                        'total_items': paginator.count,
                        'has_next': current_page.has_next(),
                        'has_previous': current_page.has_previous(),
                    },
                    'summary': {
                        'total_amount': total_sum,
                        'cleared_amount': cleared_sum,
                        'pending_amount': pending_sum,
                        'total_bills': paginator.count,
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BillDetailAPIView(APIView):
    permission_classes = [IsOperator]
    def get(self, request, bill_id):
        try:
            bill = get_object_or_404(
                Bill.objects.select_related('patient', 'doctor'), 
                id=bill_id
            )
            serializer = BillSerializer(bill, context={'request': request})
            
            context = {
                'bill': serializer.data,
                'can_process_payment': bill.payment_status != 'Cleared',
                'can_print_receipt': bill.payment_status == 'Cleared' and bill.is_receipt_available,
                'days_since_created': (timezone.now().date() - bill.created_at.date()).days,
            }
            
            return Response({
                'status': 'success',
                'data': context
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, bill_id):
        try:
            bill = get_object_or_404(Bill, id=bill_id)
            if bill.payment_status == 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Cannot modify a cleared bill'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            editable_fields = ['amount', 'description', 'payment_method', 'notes']
            updated_fields = []
            
            for field in editable_fields:
                if field in request.data:
                    setattr(bill, field, request.data[field])
                    updated_fields.append(field)
            
            bill.save()
            
            serializer = BillSerializer(bill, context={'request': request})
            
            return Response({
                'status': 'success',
                'message': 'Bill updated successfully',
                'updated_fields': updated_fields,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, bill_id):
        try:
            bill = get_object_or_404(Bill, id=bill_id)
            
            if bill.payment_status == 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Cannot delete a cleared bill'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            bill_id = bill.id
            bill.delete()
            
            return Response({
                'status': 'success',
                'message': f'Bill #{bill_id} deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)


class BillCreate(APIView):
    permission_classes = [IsOperator]
    
    def post(self, request, patient_id):
        try:
            patient = get_object_or_404(Patient, id=patient_id)
            
            amount = request.data.get('amount')
            description = request.data.get('description', '')
            doctor_id = request.data.get('doctor_id', None)
            
            if not amount:
                return Response({
                    'status': 'error',
                    'message': 'Amount is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                amount = float(amount)
                if amount <= 0:
                    raise ValueError
            except ValueError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid amount. Must be a positive number.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            doctor = None
            if doctor_id:
                from core.models import Doctor
                doctor = get_object_or_404(Doctor, id=doctor_id)
            
            bill = Bill.objects.create(
                patient=patient,
                doctor=doctor,
                amount=amount,
                description=description,
                payment_status='Pending',
                created_by=request.user,
                is_receipt_available=False
            )
            
            serializer = BillSerializer(bill, context={'request': request})
            
            return Response({
                'status': 'success',
                'message': f'Bill created for patient {patient.first_name}',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Patient not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error creating bill: {str(e)}'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProcessPaymentAPIView(APIView):
    permission_classes = [IsOperator]
    def post(self, request, bill_id):
        try:
            bill = get_object_or_404(Bill, id=bill_id)
            
            if bill.payment_status == 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'This bill is already cleared'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            amount_received = request.data.get('amount_received')
            payment_method = request.data.get('payment_method', 'Cash')
            reference_no = request.data.get('reference_no', '')
            notes = request.data.get('notes', '')
            
            if not amount_received:
                return Response({
                    'status': 'error',
                    'message': 'Amount received is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                amount_received = float(amount_received)
            except ValueError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid amount format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if amount_received < float(bill.amount):
                return Response({
                    'status': 'error',
                    'message': f'Amount received ({amount_received}) is less than bill amount ({bill.amount})',
                    'shortage': float(bill.amount) - amount_received
                }, status=status.HTTP_400_BAD_REQUEST)
            
            change = amount_received - float(bill.amount) if amount_received > float(bill.amount) else 0
            bill.payment_status = 'Cleared'
            bill.clearance_date = timezone.now()
            bill.is_receipt_available = True
            bill.payment_method = payment_method
            bill.payment_reference = reference_no
            bill.payment_notes = notes
            bill.amount_received = amount_received
            bill.processed_by = request.user
            bill.save()
            
            settings = get_system_settings()
            if settings and settings.email_enabled and bill.patient.user and bill.patient.user.email:
                send_email(
                    subject="Payment Confirmed - Receipt Available",
                    to_email=bill.patient.user.email,
                    template_name="email/bill_cleared.html",
                    context={
                        "patient_name": bill.patient.first_name,
                        "bill_id": bill.id,
                        "amount": bill.amount,
                        "amount_paid": amount_received,
                        "change": change,
                        "date": timezone.now().strftime("%Y-%m-%d %H:%M"),
                    }
                )
            
            serializer = BillSerializer(bill, context={'request': request})
            
            return Response({
                'status': 'success',
                'message': 'Payment processed successfully',
                'data': {
                    'bill': serializer.data,
                    'transaction': {
                        'amount_received': amount_received,
                        'change': change,
                        'payment_method': payment_method,
                        'reference_no': reference_no,
                        'processed_at': timezone.now().isoformat(),
                        'processed_by': request.user.get_full_name() or request.user.username
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error processing payment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendReminder(APIView):
    permission_classes=[IsAuthenticated,IsOperator]
    def post(self,request,pk):
        try:
            billl = get_object_or_404(Bill,id=pk)
            if bill.payment_status == 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Bill is already paid'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            patient = bill.patient.user
            Notification.objects.create(user=patient,title='Payment Reminder',message= f"Reminder: Please clear your outstanding bill of {bill.total_amount}.")
            return Response({
                'message': 'Clearance Reminder successfully sent.'
            },status=status.HTTP_200_OK)
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)

class RecordPaymentMethodAPIView(APIView):
    permission_classes = [IsOperator]
    
    def post(self, request, bill_id):
        try:
            bill = get_object_or_404(Bill, id=bill_id)
            
            if bill.payment_status == 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Bill is already paid'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            payment_method = request.data.get('payment_method')
            
            if not payment_method:
                return Response({
                    'status': 'error',
                    'message': 'Payment method is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            valid_methods = ['Cash', 'Card', 'Insurance', 'Debit', 'M-Pesa ', 'Cheque']
            if payment_method not in valid_methods:
                return Response({
                    'status': 'error',
                    'message': f'Invalid payment method. Choose from: {", ".join(valid_methods)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            bill.payment_method = payment_method
            bill.save(update_fields=['payment_method'])
            
            return Response({
                'status': 'success',
                'message': 'Payment method recorded successfully',
                'data': {
                    'bill_id': bill.id,
                    'payment_method': payment_method,
                    'next_step': 'process_payment'
                }
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)


class PrintReceiptAPIView(APIView):
    permission_classes = [IsOperator]
    
    def get(self, request, bill_id):
        try:
            bill = get_object_or_404(
                Bill.objects.select_related('patient__user', 'processed_by'), 
                id=bill_id
            )
            
            if bill.payment_status != 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Receipt unavailable until bill is cleared'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not bill.is_receipt_available:
                return Response({
                    'status': 'error',
                    'message': 'Receipt not available for this bill'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            context = {
                'bill': bill,
                'patient': bill.patient,
                'hospital_name': 'SmartCare Hospital',
                'hospital_address': '123 Healthcare Ave, Medical City',
                'hospital_phone': '+1 (555) 123-4567',
                'hospital_email': 'billing@smartcare.com',
                'receipt_no': f'RCP-{bill.id:06d}-{bill.clearance_date.strftime("%Y%m")}',
                'generated_by': request.user.get_full_name() or request.user.username,
                'generated_at': timezone.now(),
                'amount_in_words': self.number_to_words(float(bill.amount)),
            }
            
            pdf_content = generate_pdf("billoperator/receipt.html", context)
            
            if pdf_content is None:
                return Response({
                    'status': 'error',
                    'message': 'PDF generation failed'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            if bill.patient.user and bill.patient.user.email:
                try:
                    email = EmailMessage(
                        subject=f"Payment Receipt - Bill #{bill.id}",
                        body=f"Dear {bill.patient.first_name},\n\nPlease find attached your payment receipt for bill #{bill.id}.\n\nThank you for choosing SmartCare Hospital.",
                        to=[bill.patient.user.email],
                    )
                    email.attach(f"receipt_{bill_id}.pdf", pdf_content, "application/pdf")
                    email.send()
                except Exception as e:
                    print(f"Email sending failed: {e}")
            
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="receipt_{bill_id}.pdf"'
            
            return response
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ViewReceiptAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOperator]
    
    def get(self, request, bill_id):
        try:
            bill = get_object_or_404(Bill, id=bill_id)
            
            if request.user.user_type != 'operator' and bill.patient.user != request.user:
                return Response({
                    'status': 'error',
                    'message': 'You do not have permission to view this receipt'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if not bill.is_receipt_available or bill.payment_status != 'Cleared':
                return Response({
                    'status': 'error',
                    'message': 'Receipt not available'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = BillSerializer(bill, context={'request': request})
            
            receipt_data = {
                'receipt_number': f'RCP-{bill.id:06d}',
                'bill_id': bill.id,
                'patient_name': f"{bill.patient.first_name} {bill.patient.last_name}",
                'patient_email': bill.patient.email,
                'patient_phone': bill.patient.phone,
                'amount': float(bill.amount),
                'payment_method': bill.payment_method,
                'payment_date': bill.clearance_date.isoformat() if bill.clearance_date else None,
                'processed_by': bill.processed_by.get_full_name() if bill.processed_by else 'System',
                'items': serializer.data.get('items', []),
            }
            
            return Response({
                'status': 'success',
                'data': receipt_data
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Bill not found'
            }, status=status.HTTP_404_NOT_FOUND)


class BillingAnalyticsAPIView(APIView):
    permission_classes = [IsOperator]
    
    def get(self, request):
        try:
            period = request.query_params.get('period', 'month')  
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            today = timezone.now().date()
            
            if period == 'day':
                date_from = today
                date_to = today
            elif period == 'week':
                date_from = today - timedelta(days=7)
                date_to = today
            elif period == 'month':
                date_from = today - timedelta(days=30)
                date_to = today
            elif period == 'year':
                date_from = today - timedelta(days=365)
                date_to = today
            elif period == 'custom':
                if not date_from or not date_to:
                    return Response({
                        'status': 'error',
                        'message': 'date_from and date_to are required for custom period'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                date_from = today - timedelta(days=30)
                date_to = today
            
            bills = Bill.objects.filter(created_at__date__range=[date_from, date_to])
            cleared_bills = bills.filter(payment_status='Cleared')
            
            revenue_by_day = []
            current_date = date_from
            while current_date <= date_to:
                daily_revenue = cleared_bills.filter(
                    created_at__date=current_date
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                revenue_by_day.append({
                    'date': current_date.isoformat(),
                    'day': current_date.strftime('%A'),
                    'revenue': float(daily_revenue),
                    'count': cleared_bills.filter(created_at__date=current_date).count()
                })
                current_date += timedelta(days=1)
            
            revenue_by_method = cleared_bills.values('payment_method').annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('-total')
            
            revenue_by_doctor = cleared_bills.exclude(
                doctor__isnull=True
            ).values(
                'doctor__user__first_name', 
                'doctor__user__last_name',
                'doctor__specialization'
            ).annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('-total')[:10]
            
            summary = {
                'total_revenue': float(cleared_bills.aggregate(total=Sum('amount'))['total'] or 0),
                'total_bills': bills.count(),
                'cleared_bills': cleared_bills.count(),
                'pending_bills': bills.filter(payment_status='Pending').count(),
                'cancelled_bills': bills.filter(payment_status='Cancelled').count(),
                'average_bill_amount': float(bills.aggregate(avg=Sum('amount')/Count('id'))['avg'] or 0),
                'period_days': (date_to - date_from).days + 1,
            }
            
            return Response({
                'status': 'success',
                'data': {
                    'period': {
                        'from': date_from.isoformat(),
                        'to': date_to.isoformat(),
                        'period_type': period
                    },
                    'summary': summary,
                    'revenue_by_day': revenue_by_day,
                    'revenue_by_payment_method': list(revenue_by_method),
                    'revenue_by_doctor': list(revenue_by_doctor),
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BillingExportAPIView(APIView):
    permission_classes = [IsOperator]
    
    def get(self, request):
        try:
            export_format = request.query_params.get('format', 'csv','pdf')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            bills = Bill.objects.select_related('patient', 'doctor').all()
            
            if date_from and date_to:
                bills = bills.filter(created_at__date__range=[date_from, date_to])
            
            if export_format == 'csv':
                import csv
                from io import StringIO
                
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'Attachment; filename="billing_export_{timezone.now().date()}.csv"'
                
                writer = csv.writer(response)
                writer.writerow([
                    'Bill ID', 'Patient Name', 'Doctor', 'Amount', 'Status',
                    'Payment Method', 'Created Date', 'Cleared Date', 'Description'
                ])
                
                for bill in bills:
                    writer.writerow([
                        bill.id,
                        f"{bill.patient.first_name} {bill.patient.last_name}",
                        bill.doctor.user.get_full_name() if bill.doctor else 'N/A',
                        bill.amount,
                        bill.payment_status,
                        bill.payment_method or 'N/A',
                        bill.created_at.date(),
                        bill.clearance_date.date() if bill.clearance_date else 'N/A',
                        bill.description or ''
                    ])
                
                return response
            
            elif export_format == 'json':
                serializer = BillSerializer(bills, many=True, context={'request': request})
                return Response({
                    'status': 'success',
                    'count': bills.count(),
                    'data': serializer.data
                })
            
            else:
                return Response({
                    'status': 'error',
                    'message': 'Unsupported export format. Use csv or json.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BillingInvoice(APIView):
    permission_classes = [IsAuthenticated,IsOperator]
    def get(self,request,pk):
        bill = get_object_or_404(Bill, pk=pk)
        
        if request.user.user_type not in ['operator','admin','patient'] :
            return Response({
                'status': 'error',
                'message': 'You do not have permission to view this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer,pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        elements.append(Paragraph('<b>Hospital Invoice</b>',styles['Title']))
        elements.append(Spacer(1,0.3 * inch))
        
        data = [
            ['Invoice ID:', str(bill.id)],
            ['Patient:',bill.patient.user.first_name],
            ['Doctor:', bill.doctor.user.get_full_name() if bill.doctor else 'N/A'],
            ['Amount:', f"${bill.amount:.2f}"],
            ['Status:', bill.payment_status],
            ['Payment Method:', bill.payment_method or 'N/A'],
            ['Created At:', bill.created_at.strftime('%Y-%m-%d %H:%M')],
            ['Cleared At:', bill.clearance_date.strftime('%Y-%m-%d %H:%M') if bill.clearance_date else 'N/A'],
        ]
        
        table = Table(data,colWidths=[2 * inch, 4 * inch])
        table.setStyle([
            ('BACKGROUND',(0,0),(-1,0),colors.whitesmoke),
            ('GRID',(0,0),(-1,-1),1,colors.grey),
        ])
        
        elements.append(table)
        elements.append(Spacer(1,0.5 * inch))
        elements.append(Paragraph('Thank you for choosing SmartCare Hospital services!',styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer,content_type='application/pdf')
        response['Content-Disposition'] = f'Attachment; filename="invoice_{bill.id}.pdf"'
        
        return response
    
class StaffSearch(APIView):
    permission_classes = [IsAuthenticated,IsOperator]
    def get(self,request):
        query = request.GET.get('q','')
        
        results = {}
        bills = Bill.objects.filter(
            Q(patient__first_name__icontains=query)|
            Q(patient__last_name__icontains=query)|
            Q(amount__icontains=query)
        )[:20]
        
        results['bills'] = BillSerializer(bills,many=True).data
        
        patients = Patient.objects.filter(
            Q(patient__first_name__icontains=query)|
            Q(patient__last_name__icontains=query)|
            Q(phone__icontains=query)|
            Q(email__icontains=query)
        )[:20]
        
        return Response({
            'query': query, 'results': results
        }) 

class GetStaffProfile(APIView):
    permission_classes = [IsAuthenticated,IsOperator]
    def get(self,request):
        user = get_object_or_404(OperatorField, user=request.user)
        profile_data = {
            'username': user.username,
            'full_name': user.get_full_name(),
            'email': user.email,
            'phone': user.phone,
            'user_type': user.user_type,
        }
        serializer = OperatorProfileSerializer(profile_data)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

class UpdateStaffProfile(APIView):
    permission_classes = [IsAuthenticated,IsOperator]
    def put(self,request):
        user = get_object_or_404(OperatorField, user=request.user)
        data = request.data
        
        user.full_name = data.get('full_name', user.full_name)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone', user.phone)
        
        serializer = OperatorProfileSerializer(user,data=request.data,partial=True,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
            'status': 'success',
            'message': 'Profile updated successfully',
            'data': serializer.data
            })
        return Response({
            'message': 'Invalid data',
            'errors': serializer.errors
        },status=status.HTTP_400_BAD_REQUEST)
    
    def post(self,request):
        user = get_object_or_404(OperatorField, user=request.user)
        if 'staff_photo' in request.FILES:
            photo = request.FILES['staff_photo']
            allowed_extensions = ['jpg', 'jpeg', 'png','webp']
            file_extension = photo.name.split('.')[-1].lower()
            
            if file_extension not in allowed_extensions:
                return Response({
                    'status': 'error',
                    'message': f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            max_size = 5 * 1024 * 1024
            if photo.size > max_size:
                return Response({
                    'status': 'error',
                    'message': 'File size exceeds the maximum limit of 5MB'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = OperatorProfileSerializer(user, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                })
        return Response({
            'status': 'error',
            'message': 'Invalid data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request):
        user = get_object_or_404(OperatorField, user=request.user)
        
        if not user.staff_photo:
            return Response({
                'status': 'error',
                'message': 'No profile photo detected'
            }, status=status.HTTP_404_NOT_FOUND)
        photo_path = os.path.join(settings.MEDIA_ROOT, str(user.staff_photo))
        if os.path.exists(photo_path):
            os.remove(photo_path)
            
        user.staff_photo = None
        user.save(update_fields=['staff_photo'])
        
        return Response({
            'status': 'success',
            'message': 'Profile photo deleted successfully'
        }, status=status.HTTP_200_OK)
        
class DownloadPDFView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,bill_id):
        bill = get_object_or_404(Bill,id=bill_id)
        
        buffer = ByteIO()
        doc = SimpleDocTemplate(buffer,pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a2639'),
            alignment=1,
        )
        story.append(Paragraph(f'HOSPITAL INVOICE',title_style))
        story.append(Spacer(1,12))
        
        details =[
            [f"Invoice #:{bill.id}",f"Date: {bill.created_at.strftime('%Y-%m-%d')}"],
            [f"Patient: {bill.patient.first_name} {bill.patient.last_name}",f"Status: {bill.payment_status}"]
        ]
        
        details_table = Table(details,colWidths=[3*inch,3*inch])
        details_table.setStyle(TableStyle([
            ('FONTNAME',(0,0),(-1,-1),'Helvetica'),
            ('FONTSIZE',(0,0),(-1,-1),10),
        ]))
        
        story.append(details_table)
        story.append(Spacer(1,20))
        data = [['Description','Qty','Unit Code','Total']]
        for item in bill.items.all():
            data.append([
                item.description,
                str(item.quantity),
                f"${item.unit_price}",
                f"${item.total}",
            ])
        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer,content_type='application/pdf')
        response['Content-Desposition'] = f'attachment;filename="invoice_bill{bill.id}.pdf"'
        return response