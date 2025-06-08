from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # type: ignore
from ..models import RequisitionVoucher
from ..serializers import RequisitionVoucherSerializer, RequisitionVoucherApprovalSerializer, PrintableRequisitionVoucherSerializer
from django.db.models import Q
from notification.utils import send_notification
# 
def get_rv_code(rv: RequisitionVoucher) -> str:
    return rv.rv_number or f"RV #{rv.id}"


class RequisitionVoucherViewSet(viewsets.ModelViewSet):
    serializer_class = RequisitionVoucherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RequisitionVoucher.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        role= self.request.user.role  
        handled_by_me = self.request.query_params.get("handled_by_me")
        final_handled_by_me = self.request.query_params.get("final_handled_by_me")
        exclude_with_po = self.request.query_params.get("exclude_with_po")  # ✅ optional flag

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if exclude_with_po == "true":
            queryset = queryset.filter(purchase_order__isnull=True)  # ✅ filter out RVs with existing PO

        if handled_by_me == "true":
            user = self.request.user
            queryset = queryset.filter(
                Q(recommended_by=user) |
                Q(rejected_by=user)
            )

        if final_handled_by_me == "true":
            user = self.request.user
            queryset = queryset.filter(
                Q(final_approved_by=user) |
                Q(status="rejected", rejected_by=user)
            )
        
        return queryset


    @action(detail=True, methods=['patch'], url_path='recommend')
    def recommend(self, request, pk=None):
        rv = self.get_object()
        if rv.status != "pending":
            return Response({"detail": "Only pending RVs can be recommended."}, status=400)

        serializer = RequisitionVoucherApprovalSerializer(
            rv,
            data={"status": "recommended"},
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        if rv.material_request and rv.material_request.requester:
            print("Sending notification to:", rv.material_request.requester)
            send_notification(
                user=rv.material_request.requester,
                message=f"Your requisition voucher ({get_rv_code(rv)}) has been recommended and is awaiting final approval."
            )
        else:
            print("No material_request or requester found for RV:", rv.id)

        return Response({"message": "RV recommended."}, status=200)

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        rv = self.get_object()
        if rv.status != "recommended":
            return Response({"detail": "Only recommended RVs can be approved."}, status=400)

        serializer = RequisitionVoucherApprovalSerializer(
            rv,
            data={"status": "approved"},
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        send_notification(
            user=rv.material_request.requester,
            message=f"Your requisition voucher ({get_rv_code(rv)}) has been approved and is now queued for purchase order creation."
        )

        return Response({"message": "RV approved."}, status=200)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        rv = self.get_object()
        reason = request.data.get("rejection_reason")
        if not reason:
            return Response({"detail": "Rejection reason is required."}, status=400)

        serializer = RequisitionVoucherApprovalSerializer(
            rv,
            data={"status": "rejected", "rejection_reason": reason},
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        send_notification(
            user=rv.material_request.requester,
            message=f"Your requisition voucher ({get_rv_code(rv)}) has been rejected. Reason: {rv.rejection_reason}"
        )
        return Response({"message": "RV rejected."}, status=200)
    
    @action(detail=False, methods=["get"], url_path="custom-only")
    def custom_only(self, request):
        queryset = self.get_queryset().filter(items__material__isnull=True).distinct()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="restocking-history")
    def restocking_history(self, request):
        queryset = self.get_queryset().filter(
            is_restocking=True,
            status="approved"
        ).order_by("-created_at")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="departmental-history")
    def departmental_history(self, request):
        user = request.user
        department = None

        if user.role == "engineering":
            department = "engineering"
        elif user.role == "operations_maintenance":
            department = "operations_maintenance"
        elif user.role == "finance":
            department = "finance"

        if not department:
            return Response({"detail": "Your role is not associated with a department."}, status=403)

        queryset = self.get_queryset().filter(
            department=department,
            status="approved"
        ).order_by("-created_at")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="printable")
    def printable(self, request, pk=None):
        rv = self.get_object()
        serializer = PrintableRequisitionVoucherSerializer(rv)
        return Response(serializer.data)
