from django.conf import settings
from django.core.serializers import json
from django.db.models import Count, Q
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import labRequest,LabReport,LabTech,TestParameter,TestProfile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from Hospital.Api.serializers import (
    PatientSerializer,AppointmentSerializer,DoctorSerializer,BillSerializer,LabReportSerializer,LabRequestSerializer,ReportSerializer,LabTechSerializer,TestProfileSerializer,TestParameterSerializer
)
import os
from decimal import Decimal
from django.db import transaction
from django.core.mail import send_mail
from Hospital.Api.permissions import IsLabTechnician
from core.models import Doctor, Patient
from accounts.models import CustomUser
from core.util.pdf_generator import generate_pdf
from core.util.profile_photo import profile_photo_response
from django.core.files.base import ContentFile
from django.utils import timezone
from django.core.mail import send_mail,EmailMessage

class DashboardAnalytics(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    
    def get(self, request):
        today = timezone.now().date()
        requests = labRequest.objects.select_related(
            'patient', 'doctor__user'
        ).order_by('-created_at')
        reports = LabReport.objects.select_related(
            'lab_request__patient', 'lab_request__doctor__user', 'by'
        ).order_by('-uploaded_at')

        total_requests = requests.count()
        pending_requests = requests.filter(status__iexact='requested').count()
        processing_requests = requests.filter(status__iexact='sample_taken').count()
        completed_requests = requests.filter(status__iexact='ready').count()
        total_reports = reports.count()
        approved_requests = reports.filter(is_approved=True).count()
        critical_reports = reports.filter(is_critical=True)
        queue = requests.exclude(status__iexact='ready').exclude(
            status__iexact='cancelled'
        )[:10]
        recent_reports = reports[:10]

        def patient_name(patient):
            return f'{patient.first_name} {patient.last_name}'.strip()

        def doctor_name(doctor):
            return doctor.user.get_full_name() or doctor.user.username

        queue_data = [{
            'id': item.id,
            'type': item.test_type,
            'test': item.test_name or item.test_type,
            'patient': patient_name(item.patient),
            'patientId': item.patient_id,
            'doctor': doctor_name(item.doctor),
            'department': item.test_type,
            'waitTime': f'{max(0, int((timezone.now() - item.created_at).total_seconds() // 60))} minutes',
            'status': item.status.lower(),
        } for item in queue]
        critical_data = [{
            'id': report.id,
            'type': report.lab_request.test_type,
            'patient': patient_name(report.lab_request.patient),
            'age': report.lab_request.patient.age,
            'test': report.lab_request.test_name or report.lab_request.test_type,
            'severity': 'critical',
            'time': report.uploaded_at,
        } for report in critical_reports[:10]]
        recent_data = [{
            'id': report.id,
            'patient': patient_name(report.lab_request.patient),
            'test': report.lab_request.test_name or report.lab_request.test_type,
            'doctor': doctor_name(report.lab_request.doctor),
            'status': report.status,
            'time': report.uploaded_at,
            'is_critical': report.is_critical,
        } for report in recent_reports]
        category_stats = list(requests.values('test_type').annotate(
            total=Count('id')
        ).order_by('test_type'))
        technician = LabTech.objects.filter(user=request.user).first()

        return Response({
            'status': 'success',
            'data': {
                'technician': ({
                    'name': technician.full_name,
                    'role': 'Lab Technician',
                    'isSupervisor': False,
                    'id': technician.id,
                } if technician else None),
                'statistics': {
                    'totalTests': total_requests,
                    'pendingTests': pending_requests,
                    'completedTests': completed_requests,
                    'criticalResults': critical_reports.count(),
                    'avgProcessingTime': 'Not available',
                    'completionRate': round(
                        completed_requests / total_requests * 100
                    ) if total_requests else 0,
                },
                'summary': {
                    'total_requests': total_requests,
                    'pending': pending_requests,
                    'processing': processing_requests,
                    'completed': completed_requests,
                    'approved': approved_requests,
                    'total_reports': total_reports,
                    'reports_today': reports.filter(uploaded_at__date=today).count(),
                    'pending_approvals': reports.filter(is_approved=False).count()
                },
                'testQueue': queue_data,
                'criticalResults': critical_data,
                'recentResults': recent_data,
                'equipment': [],
                'chartLabels': [],
                'volumeData': [],
                'categoryLabels': [item['test_type'] for item in category_stats],
                'categoryData': [item['total'] for item in category_stats],
                'recent_activity': recent_data,
            }
        })

class DetailLabRequest(APIView):
    permission_classes =[IsAuthenticated,IsLabTechnician]
    def get(self,request,request_id):
        try:
            lab_request = get_object_or_404(labRequest,id=request_id)
            serializer = LabRequestSerializer(lab_request,context={'request':request})
            return Response({
                'status': 'sucess',
                'data': serializer.data
            },status=status.HTTP_200_OK)
        except labRequest.DoesNotExist:
            return Response({
                'status': 'error','message': 'Lab request not found'
            })
            
class DetailLabReport(APIView):
    permission_classes =[IsAuthenticated,IsLabTechnician]
    def get(self,request,request_id):
        try:
            lab_report = get_object_or_404(LabReport,id=request_id)
            serializer = LabReportSerializer(lab_report,context={'request':request})
            return Response({
                'status': 'sucess',
                'data': serializer.data
            },status=status.HTTP_200_OK)
        except LabReport.DoesNotExist:
            return Response({
                'status': 'error','message': 'Lab report not found'
            })

class UpdateLabRequestStatus(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    def patch(self,request,request_id):
        try:
            lab_request = get_object_or_404(labRequest,id=request_id)
            new_status = request.data.get('status')
            if new_status and new_status in ['sample_taken','ready','cancelled']:
                lab_request.status = new_status
                lab_request.save(update_fields=['status','updated_at'])
                return Response({
                    'status': 'success',
                    'message': f'Lab request status update to {new_status}',
                    'data': LabRequestSerializer(lab_request,context={'request':request}).data
                },status=status.HTTP_200_OK)
            else:
                return Response({
                    'status':'error',
                    'message': "Invalid status provided"
                },status=status.HTTP_400_BAD_REQUEST)
        except labRequest.DoesNotExist:
            return Response({
                'status': 'error',
                'message': "Lab request not found"
            },status=status.HTTP_400_BAD_REQUEST)

class UploadLabReport(APIView):
    permission_classes =[IsAuthenticated,IsLabTechnician]
    def post(self,request,request_id):
        try:
            lab_request = get_object_or_404(labRequest,id=request_id)
            if LabReport.objects.filter(lab_request=lab_request).exists():
                return Response({
                    'status': "error",'message': 'Report already uploaded for this request'
                },status=status.HTTP_400_BAD_REQUEST)
            
            report_file = request.FILES.get('report_file')
            remarks = request.data.get('remarks',"")
            
            if not report_file:
                return Response({
                    'status':'error',
                    'message': 'Report file required'
                },status=status.HTTP_400_BAD_REQUEST)
            
            lab_report = LabReport.objects.create(
                lab_request=lab_request,
                uploaded_by=request.user,
                report_file=report_file,
                remarks=remarks
            )
            lab_request.status = 'ready'
            lab_request.save(update_fields=['status','uploaded_at'])
            
            serializer = LabReportSerializer(lab_report,context={'request':request})
            return Response({
                'status': 'success',
                'message': 'Lab report uploaded successfully',
                'data': serializer.data
            },status=status.HTTP_201_CREATED)
        except labRequest.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Lab request not found'
            },status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error uploading report: {str(e)}. Try again!'
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateLabReport(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    def put(self,request,request_id):
        try:
            lab_request = get_object_or_404(labRequest,id=request_id)
            lab_report = get_object_or_404(LabReport,lab_request=lab_request)
            
            report_file = request.FILES.get('report_file')
            if report_file:
                lab_report.report_file = report_file
            remarks = request.data.get('remarks')
            if remarks is not None:
                lab_report.remarks = remarks
            
            lab_report.save()
            serializer = LabReportSerializer(lab_report,context={'request':request})
            return Response({
                'status': 'success',
                'message': 'Lab reports uploaded successfully',
                'data': serializer.data
            },status=status.HTTP_200_OK)
        except labRequest.DoesNotExist:
            return Response({
                'status':'error',
                'message': 'Lab request not found'
            },status=status.HTTP_404_NOT_FOUND)

class ApproveLabResults(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def post(self,request,report_id):
        try:
            lab_report = get_object_or_404(LabReport,id=report_id)
            
            if lab_report.is_approved:
                return Response({
                    'status': 'error',
                    'message': 'Lab report already approved'
                },status=status.HTTP_400_BAD_REQUEST)
                
            lab_report.is_approved = True
            lab_report.approved_by = request.user
            lab_report.reviewed_at = timezone.now()
            lab_report.save(update_fields=['is_approved','approved_by','reviewed_at'])
            
            lab_request = lab_report.lab_request
            lab_request.status = 'ready'
            lab_request.save(update_fields=['status'])
            
            serializer = LabReportSerializer(lab_report,context={'request':request})
            return Response({
                'status': 'success',
                'message': 'Lab report approved successfully',
                'data': serializer.data
            },status=status.HTTP_200_OK)
        except LabReport.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Lab report not found'
            },status=status.HTTP_404_NOT_FOUND)
    
class RejectResult(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def post(self,request,report_id):
            try:
                report = get_object_or_404(LabReport,id=report_id)
                reason = request.data.get('reason','No reason provided')
                
                report.is_approved = False
                report.approved_by = request.user
                report.rejected_reason = reason
                report.reviewed_at = timezone.now()
                report.save(update_fields=['is_approved','approved_by','rejected_reason','reviewed_at'])
                
                lab_request = report.lab_request
                lab_request.status = 'sample_taken'
                lab_request.save(update_fields=['status'])
                
                return Response({
                    'status': 'success',
                    'message': 'Lab report rejected successfully'
                },status=status.HTTP_200_OK)
            except LabReport.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Lab report not found'
                },status=status.HTTP_404_NOT_FOUND)

class SendToDoctor(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def post(self,request,report_id):
        report = get_object_or_404(LabReport, id=report_id)
        if report.is_sent_to_doctor:
            return Response({
                'status': 'error',
                'message': 'Lab report already sent to doctor'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            context = {
                'report_id': report.id,
                'patient_name': f"{report.lab_request.patient.first_name} {report.lab_request.patient.last_name}",
                'test_type': report.lab_request.test_type,
                'remarks': report.remarks,
                'uploaded_at': report.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            pdf_bytes = generate_pdf('lab_report_template.html', context)
            if pdf_bytes is None:
                return Response({
                    'status': 'error',
                    'message': 'Failed to generate PDF report'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            filename = f'LabReport_{report.id}.pdf'
            report.report_file.save(filename,ContentFile(pdf_bytes))
            report.is_sent_to_doctor = True
            report.save(update_fields=['report_file','is_sent_to_doctor'])
            
            doctor_email = report.lab_request.doctor.user.email
            subject = f'Lab Report for {report.lab_request.patient.user.first_name} {report.lab_request.patient.user.last_name}'
            body = f"Dear Dr. {report.lab_request.doctor.user.last_name},\n\nThe lab report for your patient {report.lab_request.patient.user.first_name} {report.lab_request.patient.user.last_name} is now ready. Please find the attached report for details.\n\nBest regards,\nHospital Lab Team"
            email = EmailMessage(subject, body, to=[doctor_email])
            email.attach(report.report_file.name, pdf_bytes, 'application/pdf')
            try:
                email.send()
            except Exception as e:
                LabReport.objects.create(report=report,note=f'Failed to send email: {str(e)}')
                return Response({
                    'status': 'error',
                    'message': f'Lab report generated but failed to send email: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Doctor.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Doctor not found for this lab report'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'An error occured {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class LabSearch(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def get(self,request):
        query = request.GET.get('q','')
        results = {}
        if not query:
            return Response({
                'status':'error',
                'message':'Query is required'
            },status=status.HTTP_400_BAD_REQUEST)
        Q = None
        requests = labRequest.objects.filter(
            Q(test_name__icontains=query)|
            Q(patient__first_name=query)|
            Q(patient__last_name=query)|
            Q(doctor__user__full_name=query)
        )[:20]
        
        results['requests'] = LabRequestSerializer(requests,many=True).data
        
        results_data = LabReport.objects.filter(
            Q(lab_request_test_name__icontains=query)|
            Q(lab_request__patient__first_name=query)|
            Q(remarks__icontains=query)
        )[:20]
        results['results'] = LabReportSerializer(results_data,many=True).data
        
        return Response({
            'query': query, 'results':results
        })
        
class LabRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    def get(self,request):
        status_filter = request.GET.get('status')
        priority_filter = request.GET.get('priority')
        search_query = request.GET.get('search')
        
        queryset = labRequest.objects.select_related('patient', 'doctor__user')
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status__iexact=status_filter)
        if priority_filter and priority_filter != 'all':
            queryset = queryset.filter(urgency=priority_filter)
        if search_query:
            search_filter = (
                Q(patient__first_name__icontains=search_query)|
                Q(patient__last_name__icontains=search_query)|
                Q(doctor__user__first_name__icontains=search_query)|
                Q(doctor__user__last_name__icontains=search_query)|
                Q(test_type__icontains=search_query)
            )
            if search_query.isdigit():
                search_filter |= Q(id=int(search_query))
            queryset = queryset.filter(search_filter)

        queryset = queryset.order_by('-created_at')
        total_count = queryset.count()
        try:
            page_size = max(1, min(int(request.GET.get('page_size', 20)), 100))
            page = max(1, int(request.GET.get('page', 1)))
        except (TypeError, ValueError):
            return Response({
                'status': 'error',
                'message': 'page and page_size must be positive integers',
            }, status=status.HTTP_400_BAD_REQUEST)
        start = (page - 1) * page_size
        requests = queryset[start:start + page_size]
        serializer = LabRequestSerializer(requests, many=True, context={'request': request})
        serialized_requests = serializer.data
        
        return Response({
            'status': 'success',
            'data': serialized_requests,
            'requests': serialized_requests,
            'stats': {
                'total': total_count,
                'requested': queryset.filter(status__iexact='requested').count(),
                'processing': queryset.filter(status__iexact='processing').count(),
                'sample_taken': queryset.filter(status__iexact='sample_taken').count(),
                'ready': queryset.filter(status__iexact='ready').count(),
                'cancelled': queryset.filter(status__iexact='cancelled').count(),
            },
            'pagination': {
                'total': total_count,
                'page': page,
                'page_size': page_size,
                'total_pages': (total_count + page_size - 1) // page_size,
            }
        })
class LabReportListView(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    def get(self,request):
        status_filter = request.GET.get('status')
        search_query = request.GET.get('search')
        
        queryset = LabReport.objects.select_related(
            'lab_request__patient', 'lab_request__doctor__user', 'by'
        )
        
        if status_filter == 'approved':
            queryset = queryset.filter(is_approved=True)
        elif status_filter == 'pending':
            queryset = queryset.filter(is_approved=False)
            
        if search_query:
            queryset = queryset.filter(
                Q(lab_request__patient__first_name__icontains=search_query)|
                Q(lab_request__patient__last_name__icontains=search_query)|
                Q(lab_request__doctor__user__first_name__icontains=search_query)|
                Q(lab_request__doctor__user__last_name__icontains=search_query)|
                Q(lab_request__test_type__icontains=search_query)
            )

        queryset = queryset.order_by('-uploaded_at')
        total_count = queryset.count()
        try:
            page_size = max(1, min(int(request.GET.get('page_size', 20)), 100))
            page = max(1, int(request.GET.get('page', 1)))
        except (TypeError, ValueError):
            return Response({
                'status': 'error',
                'message': 'page and page_size must be positive integers',
            }, status=status.HTTP_400_BAD_REQUEST)
        start = (page - 1) * page_size
        reports = queryset[start:start + page_size]
        serializer = LabReportSerializer(reports, many=True, context={'request': request})
        
        return Response({
            'status': 'success',
            'data': serializer.data,
            'pagination': {
                'total': total_count,
                'page': page,
                'page_size': page_size,
                'total_pages': (total_count + page_size - 1) // page_size,
            }
        })
        
class PatientLabHistory(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    def get(self,request,patient_id):
        patient = get_object_or_404(Patient,id=patient_id)
        
        lab_requests = labRequest.objects.filter(patient=patient).order_by('-created_at').select_related('doctor')
        lab_reports = LabReport.objects.filter(lab_request__patient=patient).order_by('-uploaded_at').select_related('by','lab_request')
        request_serializer = LabRequestSerializer(lab_requests,many=True,context={'request':request})
        reports_serializer = LabReportSerializer(lab_reports,many=True,context={'request':request})
        
        return Response ({
            'status':'success',
            'data':{
                'patient':{
                    'id': patient.id,
                    'name': f"{patient.first_name} {patient.last_name}",
                    'age': patient.age,
                    'gender': patient.gender,
                    'phone': patient.phone,
                    'email': patient.email,
                },
                'lab_requests': request_serializer.data,
                'lab_reports': reports_serializer.data
            }
        },status=status.HTTP_200_OK)
        
class LabStats(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def get(self,request):
        today = timezone.now().date()
        total_requests = labRequest.objects.count()
        completed_requests = labRequest.objects.filter(status__iexact='ready').count()
        pending_requests = labRequest.objects.filter(status__iexact='requested').count()
        total_reports = LabReport.objects.count()
        approved_reports = LabReport.objects.filter(is_approved=True).count()
        test_type_stats = labRequest.objects.values('test_type').annotate(
            total = Count('id'),
            completed = Count('id',filter=Q(status__iexact='ready')),
            pending = Count('id',filter=Q(status__iexact='requested')),
        ).order_by('-total')
        
        monthly_trends = []
        for i in range(6):
            month_date = today.replace(day=1) - timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if i ==0:
                month_end=today
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            monthly_requests = labRequest.objects.filter(
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            ).count()
            
            monthly_completed = labRequest.objects.filter(
                status__iexact='ready',
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            ).count()
            
            monthly_trends.append({
                'month': month_start.strftime("%B %Y"),
                'requests': monthly_requests,
                'completed': monthly_completed
            })
        technician_stats = LabReport.objects.values('by__username').annotate(
            total_reports=Count('id'),
            approved_reports=Count('id',filter=Q(is_approved=True)),
            pending_reports=Count('id',filter=Q(is_approved=False))
        ).order_by('-total_reports')
            
        return Response({
            'status': 'success',
            'data': {
                'totalTests': total_requests,
                'completedTests': completed_requests,
                'pendingTests': pending_requests,
                'approvalRate': round(approved_reports / total_reports * 100) if total_reports else 0,
                'test_type_stats': list(test_type_stats),
                'monthly_trends': monthly_trends,
                'technician_stats': list(technician_stats)
            }
        })
            
class GetLabTechProfile(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def get(self,request):
        lab_tech = LabTech.objects.filter(user=request.user).first()
        if lab_tech is None:
            return Response({'status': 'success', 'data': None})
        serializer = LabTechSerializer(lab_tech, context={'request': request})
        return Response({'status': 'success', 'data': serializer.data})

class GetLabTechProfilePhoto(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):
        lab_tech = get_object_or_404(LabTech, user=request.user)
        return profile_photo_response(lab_tech.photo)
    
class UpdateLabProfile(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def put(self,request):
        lab_tech = get_object_or_404(LabTech, user=request.user)
        serializer = LabTechSerializer(
            lab_tech,data=request.data,partial=True,context={'request':request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message':'Profile updated successfully',
                'data':serializer.data
            })
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def post(self,request):
        lab_tech = get_object_or_404(LabTech,user=request.user)
        if 'photo' in request.FILES:
            photo = request.FILES['photo']
            allowed_extensions = ['jpg','jpeg','png','gif','webp']
            file_extension = photo.name.split('.')[-1].lower()
            
            if file_extension not in allowed_extensions:
                return Response({
                    'error': f'file type not allowed. Try {", ".join(allowed_extensions)}'
                },status = status.HTTP_400_BAD_REQUEST)
            max_size = 5 * 1024 * 1024
            if photo.size > max_size:
                return Response({
                    'error': 'File too large. Max size: 5MB'
                },status=status.HTTP_400_BAD_REQUEST)
            
            if lab_tech.photo:
                old_photo_path = os.path.join(settings.MEDIA_ROOT,str(lab_tech.photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
                    
            lab_tech.photo = photo
            lab_tech.save()
            serializer = LabTechSerializer(lab_tech,context={'request':request})
            return Response({
                'status': 'success',
                'message':'Profile updated successfully',
                'data':serializer.data
            })
        return Response({
            'status': 'error',
            'message': 'No profile photo was provided.'
        },status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        lab_tech = get_object_or_404(LabTech, user=request.user)
        
        if not lab_tech.lab_tech:
            return Response({
                'error': 'No profile photo to delete'
            }, status=status.HTTP_404_NOT_FOUND)
        
        photo_path = os.path.join(settings.MEDIA_ROOT, str(lab_tech.photo))
        if os.path.exists(photo_path):
            os.remove(photo_path)
        
        lab_tech.photo = None
        lab_tech.save()
        
        return Response({
            'message': 'Profile photo deleted successfully'
        }, status=status.HTTP_200_OK)
        
class TestProfileListView(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def get(self,request):
        profiles = TestProfile.objects.filter(is_active=True).prefetch_related('parameters')
        data = [] 
        
        for profile in profiles:
            data.append({
                'id': profile.id,
                'name': profile.name,
                'code': profile.code,
                'category': profile.category,
                'description': profile.description,
                'fasting_required': profile.fasting_required,
                'parameters':[
                    {
                        'id': param.id,
                        'name': param.name,
                        'code': param.code,
                        'unit': param.unit,
                        'refernce_range': param.refrence_range,
                        'decimal_places': param.decimal_places,
                        'is_critical': param.is_critical,
                        'sort_order': param.sort_order,
                    }
                    for param in profile.parameters.all()
                ]
            })
        
        return Response({'status': 'success', 'data': data})
    
class TestProfileDetailView(APIView):
    permission_classes = [IsAuthenticated,IsLabTechnician]
    def get(self,request,profile_id):
        try:
            profile = TestProfile.objects.get(id=profile_id,is_active=True)
            parameters = profile.parameters.all()
            
            return Response({
                'status': 'success',
                'data':{
                    'id': profile.id,
                    'name': profile.name,
                    'code': profile.code,
                    'category': profile.category,
                    'description': profile.description,
                    'fasting_required': profile.fasting_required,
                    'parameters':[
                        {
                            'id': param.id,
                            'name': param.name,
                            'code': param.code,
                            'unit': param.unit,
                            'refernce_range': param.refrence_range,
                            'decimal_places': param.decimal_places,
                            'is_critical': param.is_critical,
                            'sort_order': param.sort_order,
                        }
                        for param in profile.parameters.all()
                    ]
                }
            })
        except TestProfile.DoesNotExist:
            return Response({'status':'error','message': 'Test profile not found.'},status=404)

class GetResultEntryView(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    
    def get(self, request, request_id):
        try:
            lab_request = labRequest.objects.select_related(
                'patient', 'doctor', 'test_profile'
            ).get(id=request_id)
            
            existing_results = {}
            if lab_request.structured_results:
                existing_results = lab_request.structured_results.get('results', {})
            
            response_data = {
                'id': lab_request.id,
                'test_name': lab_request.test_name,
                'status': lab_request.status,
                'patient': {
                    'id': lab_request.patient.id,
                    'first_name': lab_request.patient.first_name,
                    'last_name': lab_request.patient.last_name,
                    'age': lab_request.patient.age,
                    'gender': lab_request.patient.gender,
                    'phone': lab_request.patient.phone,
                },
                'doctor': {
                    'id': lab_request.doctor.id,
                    'full_name': lab_request.doctor.full_name,
                    'speciality': lab_request.doctor.speciality,
                },
                'requested_date': lab_request.requested_date,
            }
            
            if lab_request.test_profile:
                profile = lab_request.test_profile
                parameters = profile.parameters.all()
                
                response_data['test_profile'] = {
                    'id': profile.id,
                    'name': profile.name,
                    'code': profile.code,
                    'category': profile.category,
                    'fasting_required': profile.fasting_required,
                    'parameters': [
                        {
                            'id': param.id,
                            'name': param.name,
                            'code': param.code,
                            'unit': param.unit,
                            'reference_range': param.reference_range,
                            'decimal_places': param.decimal_places,
                            'is_critical': param.is_critical,
                            'is_required': param.is_required,
                            'existing_value': existing_results.get(str(param.id), {}).get('value'),
                            'existing_status': existing_results.get(str(param.id), {}).get('status'),
                        }
                        for param in parameters
                    ]
                }
            else:
                response_data['test_profile'] = None
            
            return Response({
                'status': 'success',
                'data': response_data
            })
            
        except labRequest.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Lab request not found'
            }, status=404)


class SaveStructuredResultsView(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    
    @transaction.atomic
    def post(self, request, request_id):
        try:
            lab_request = labRequest.objects.select_related(
                'patient', 'doctor'
            ).get(id=request_id)
            
            results_data = json.loads(request.data.get('results_data', '{}'))
            remarks = request.data.get('remarks', '')
            performed_by = request.data.get('by', '')
            quality_control_passed = request.data.get('quality_control_passed', 'false') == 'true'
            quality_control_notes = request.data.get('quality_control_notes', '')
            
            critical_alerts = []
            for param_id, result in results_data.items():
                param = TestParameter.objects.get(id=param_id)
                value = result.get('value')
                
                if value and param.is_critical:
                    num_value = Decimal(str(value))
                    is_critical = False
                    
                    if param.reference_range_low and num_value <= param.reference_range_low:
                        is_critical = True
                    if param.reference_range_high and num_value >= param.reference_range_high:
                        is_critical = True
                    
                    if is_critical:
                        critical_alerts.append({
                            'parameter': param.name,
                            'value': str(num_value),
                            'reference_range': param.reference_range,
                        })
            
            lab_request.structured_results = {
                'results': results_data,
                'performed_by': performed_by,
                'quality_control': {
                    'passed': quality_control_passed,
                    'notes': quality_control_notes,
                },
                'remarks': remarks,
                'critical_alerts': critical_alerts,
            }
            
            lab_request.status = 'ready'
            lab_request.save()
            report_file = request.FILES.get('report_file')
            if report_file:
                lab_report = LabReport.objects.create(
                    lab_request=lab_request,
                    uploaded_by=request.user,
                    report_file=report_file,
                    remarks=remarks,
                    by=performed_by,
                    quality_control_passed=quality_control_passed,
                    quality_control_notes=quality_control_notes,
                    structured_results=lab_request.structured_results,
                )
            else:
                lab_report = LabReport.objects.create(
                    lab_request=lab_request,
                    uploaded_by=request.user,
                    remarks=remarks,
                    by=performed_by,
                    quality_control_passed=quality_control_passed,
                    quality_control_notes=quality_control_notes,
                    structured_results=lab_request.structured_results,
                )
            
            return Response({
                'status': 'success',
                'message': f'Results saved successfully{" with critical alerts" if critical_alerts else ""}',
                'data': {
                    'report_id': lab_report.id,
                    'critical_alerts': critical_alerts,
                }
            })
            
        except labRequest.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Lab request not found'
            }, status=404)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error saving results: {str(e)}'
            }, status=500)
    
    def send_critical_alerts(self, lab_request, critical_alerts):
        try:
            doctor_email = lab_request.doctor.email
            patient_name = f"{lab_request.patient.first_name} {lab_request.patient.last_name}"
            
            alert_details = "\n".join([
                f"- {alert['parameter']}: {alert['value']} (Reference: {alert['reference_range']})"
                for alert in critical_alerts
            ])
            
            subject = f"CRITICAL LAB ALERT: {patient_name}"
            message = f"""
            Dear Dr. {lab_request.doctor.full_name},
            
            CRITICAL values detected for your patient {patient_name}:
            
            {alert_details}
            
            Test: {lab_request.test_name}
            Request ID: {lab_request.id}
            
            Please review immediately.
            
            Best regards,
            Laboratory Department
            """
            
            send_mail(
                subject,
                message,
                'lab@SmartCarehospital.com',
                [doctor_email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send critical alert email: {str(e)}")


class GetStructuredResultsView(APIView):
    permission_classes = [IsAuthenticated, IsLabTechnician]
    
    def get(self, request, report_id):
        try:
            lab_report = LabReport.objects.select_related(
                'lab_request__patient', 
                'lab_request__doctor',
            ).get(id=report_id)
            
            test_profile = lab_report.lab_request.test_profile
            parameters = []
            if test_profile:
                parameters = test_profile.parameters.all()
            
            results = lab_report.structured_results.get('results', {})
            
            formatted_results = []
            for param in parameters:
                param_results = results.get(str(param.id), {})
                formatted_results.append({
                    'id': param.id,
                    'name': param.name,
                    'code': param.code,
                    'unit': param.unit,
                    'reference_range': param.reference_range,
                    'value': param_results.get('value'),
                    'status': param_results.get('status', 'pending'),
                    'notes': param_results.get('notes', ''),
                    'is_critical': param.is_critical,
                })
            
            return Response({
                'status': 'success',
                'data': {
                    'report': {
                        'id': lab_report.id,
                        'uploaded_at': lab_report.uploaded_at,
                        'uploaded_by': lab_report.uploaded_by.username if lab_report.uploaded_by else None,
                        'is_approved': lab_report.is_approved,
                        'approved_by': lab_report.approved_by.username if lab_report.approved_by else None,
                        'reviewed_at': lab_report.reviewed_at,
                        'report_file': lab_report.report_file.url if lab_report.report_file else None,
                        'remarks': lab_report.remarks,
                        'equipment_used': lab_report.equipment_used,
                        'performed_by': lab_report.by,
                        'quality_control_passed': lab_report.quality_control_passed,
                        'quality_control_notes': lab_report.quality_control_notes,
                    },
                    'request': {
                        'id': lab_report.lab_request.id,
                        'test_name': lab_report.lab_request.test_name,
                        'requested_date': lab_report.lab_request.requested_date,
                        'patient': {
                            'id': lab_report.lab_request.patient.id,
                            'first_name': lab_report.lab_request.patient.first_name,
                            'last_name': lab_report.lab_request.patient.last_name,
                            'age': lab_report.lab_request.patient.age,
                            'gender': lab_report.lab_request.patient.gender,
                        },
                        'doctor': {
                            'id': lab_report.lab_request.doctor.id,
                            'full_name': lab_report.lab_request.doctor.full_name,
                            'speciality': lab_report.lab_request.doctor.speciality,
                        }
                    },
                    'results': formatted_results,
                    'critical_alerts': lab_report.structured_results.get('critical_alerts', []),
                }
            })
            
        except LabReport.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Lab report not found'
            }, status=404)