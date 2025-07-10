from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from authentication.models import User
from notification.utils import send_notification
from django_filters.rest_framework import DjangoFilterBackend
from material_requests.filters.material_requests import MaterialRequestFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from django.utils import timezone
from datetime import datetime

from ..models import MaterialRequest, ChargeTicket, ChargeTicketItem, RequisitionVoucher, RequisitionItem
from material_requests.serializers.material_requests import MaterialRequestSerializer, WorkOrderAssignmentSerializer

class EightPerPagePagination(PageNumberPagination):
    page_size = 8

class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.all().prefetch_related("items")
    serializer_class = MaterialRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = [
        "purpose", 
        "work_order_no", 
        "requester__first_name", 
        "requester__last_name",
        "location",
        "items__material__name",
        "items__custom_name"
    ]
    filterset_class = MaterialRequestFilter
    pagination_class = EightPerPagePagination
    ordering_fields = [
        'created_at',
        'status',
        'department',
        'work_order_no',
        'target_completion'
    ]
    ordering = ['-created_at']  # default ordering

    def perform_create(self, serializer):
        material_request = serializer.save(requester=self.request.user)
        recipients = User.objects.filter(role=material_request.department, is_role_confirmed=True)
        for user in recipients:
            send_notification(
                user=user,
                message=f"{self.request.user.get_full_name()} submitted a new material request for evaluation.",
                link=f"/pages/{material_request.department}/material-requests/{material_request.id}/items"
            )

    def get_queryset(self):
        user = self.request.user
        role = user.role
        queryset = super().get_queryset()

        # Apply date range filter if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                queryset = queryset.filter(created_at__range=[start, end])
            except ValueError:
                pass

        # Apply status filter if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Apply department filter if provided
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department=department)

        # For detail view, allow requester or department members to see the request
        if self.action == "retrieve":
            return queryset.filter(
                Q(requester=user) | Q(department=role)
            )

        if self.action == "my_requests":
            return queryset.filter(requester=user)

        if self.action == "handled_requests":
            if role == "warehouse_staff":
                return queryset.exclude(status="pending")
            return queryset.filter(
                department=role
            ).exclude(status="pending")

        # Main material-requests endpoint
        if role == "warehouse_staff":
            return queryset.filter(
                (
                    Q(department__in=["engineering", "operations_maintenance"], status="won_assigned") |
                    Q(department="finance", status="pending")
                )
            )

        if role in ["engineering", "operations_maintenance", "finance"]:
            return queryset.filter(department=role)

        return MaterialRequest.objects.none()

    @action(detail=False, methods=["get"])
    def my_requests(self, request):
        queryset = MaterialRequest.objects.filter(requester=request.user).order_by("-created_at")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def evaluate(self, request, pk=None):
        try:
            req = MaterialRequest.objects.get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=404)

        action = request.data.get("action", "evaluate")

        if action in ["rejected", "invalid"]:
            req.status = action
            rejection_reason = request.data.get("rejection_reason")
            if action == "rejected" and rejection_reason:
                req.rejection_reason = rejection_reason 
            req.save()
            send_notification(
                user=req.requester,
                message=f"Your material request has been {action}ed by {req.department.title()}.",
                link=f"/material-requests/{req.id}"
            )
            return Response({"message": f"Request {action}ed."})

        charge_items = request.data.get("charge_items", [])
        requisition_items = request.data.get("requisition_items", [])

        if charge_items:
            ticket = ChargeTicket.objects.create(
                requester=req.requester,
                department=req.department,
                purpose=req.purpose,
                origin="employee",
                material_request=req  
            )
            for item in charge_items:
                if not item.get("material_id"):
                    continue
                ChargeTicketItem.objects.create(
                    charge_ticket=ticket,
                    material_id=item["material_id"],
                    quantity=item["quantity"],
                    unit=item["unit"]
                )
            for gm in User.objects.filter(role="manager", is_role_confirmed=True):
                send_notification(
                    user=gm,
                    message=f"A new charge ticket from {req.department.title()} needs your approval."
                )

        if requisition_items:
            rv = RequisitionVoucher.objects.create(
                requester=req.requester,
                department=req.department,
                purpose=req.purpose,
                origin="employee",
                material_request=req
            )
            for item in requisition_items:
                if item.get("material_id"):
                    RequisitionItem.objects.create(
                        requisition=rv,
                        material_id=item["material_id"],
                        quantity=item["quantity"],
                        unit=item["unit"]
                    )
                else:
                    RequisitionItem.objects.create(
                        requisition=rv,
                        custom_name=item.get("custom_name"),
                        custom_unit=item.get("custom_unit"),
                        quantity=item["quantity"],
                        unit=item["unit"]
                    )
            for analyst in User.objects.filter(role="budget_analyst", is_role_confirmed=True):
                send_notification(
                    user=analyst,
                    message=f"A new Requisition Voucher ({rv.rv_number}) requires recommendation.",
                    link=f"/requisition-vouchers/{rv.id}"
                )

        if charge_items and requisition_items:
            req.status = "partially_fulfilled"
        elif charge_items:
            req.status = "charged"
        elif requisition_items:
            req.status = "requisitioned"
        else:
            req.status = "invalid"

        req.save()
        send_notification(
            user=req.requester,
            message=f"Your material request has been evaluated by the {req.department.title()} department.",
            link=f"/material-requests/{req.id}"
        )
        return Response({"message": "Evaluation complete."})

    @action(detail=False, methods=["get"])
    def handled_requests(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="assign-work-order")
    def assign_work_order(self, request, pk=None):
        try:
            request_obj = MaterialRequest.objects.get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response({"error": "Material Request not found."}, status=404)

        if request.user.role not in ["engineering", "operations_maintenance"]:
            return Response({"error": "Not authorized to assign work order."}, status=403)

        prev_status = request_obj.status
        serializer = WorkOrderAssignmentSerializer(request_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Only set status if it was pending before
            if prev_status == "pending":
                request_obj.status = "won_assigned"
            # Always set who assigned
            request_obj.work_order_assigned_by = request.user
            request_obj.save()
            send_notification(
                user=request_obj.requester,
                message=f"Your material request has been assigned a Work Order Number by the {request_obj.department.title()} department."
            )
            return Response({"message": "Work order assigned and requester notified."})
        
        return Response(serializer.errors, status=400)
