from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from authentication.models import User
from notification.utils import send_notification
from django_filters.rest_framework import DjangoFilterBackend
from material_requests.filters.material_requests import MaterialRequestFilter
from rest_framework.pagination import PageNumberPagination


from ..models import MaterialRequest, ChargeTicket, ChargeTicketItem, RequisitionVoucher, RequisitionItem
from material_requests.serializers.material_requests import MaterialRequestSerializer

class EightPerPagePagination(PageNumberPagination):
    page_size = 8

class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.all().prefetch_related("items")
    serializer_class = MaterialRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MaterialRequestFilter
    pagination_class = EightPerPagePagination
    
    def perform_create(self, serializer):
        material_request = serializer.save(requester=self.request.user)
        
         # ✅ Notify the department the request is assigned to
        recipients = User.objects.filter(role=material_request.department)
        for user in recipients:
            send_notification(
                user=user,
                message=f"{self.request.user.get_full_name()} submitted a new material request to your department for evaluation."
            )

    def get_queryset(self):
        user = self.request.user
        role = user.role

        if self.action == "my_requests":
            return MaterialRequest.objects.filter(requester=user).order_by("-created_at")

        if self.action == "handled_requests":
            if role == "warehouse_staff":
                return MaterialRequest.objects.filter(
                    department="finance"
                ).exclude(status="pending").order_by("-created_at")
            
            return MaterialRequest.objects.filter(
                department=role
            ).exclude(status="pending").order_by("-created_at")

        if role == "warehouse_staff":
            return MaterialRequest.objects.filter(
                department="finance",
                status="pending"
            ).order_by("-created_at")
            
        if role in ["engineering", "operations_maintenance", "finance"]:
            return MaterialRequest.objects.filter(department=role).order_by("-created_at")

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

        if action in ["reject", "invalid"]:
            req.status = action
            req.save()
            send_notification(
                user=req.requester,
                message=f"Your material request has been {action}ed by {req.department.title()}."
            )
            return Response({"message": f"Request {action}ed."})

        # Normal evaluation
        charge_items = request.data.get("charge_items", [])
        requisition_items = request.data.get("requisition_items", [])

        if charge_items:
            ticket = ChargeTicket.objects.create(
                requester=req.requester,
                department=req.department,
                purpose=req.purpose,
                origin="employee"
            )
            for item in charge_items:
                if not item.get("material_id"):
                    continue  # skip custom items
                ChargeTicketItem.objects.create(
                    charge_ticket=ticket,
                    material_id=item["material_id"],
                    quantity=item["quantity"],
                    unit=item["unit"]
                )
            # ✅ Notify General Manager
            gms = User.objects.filter(role="manager")
            for gm in gms:
                send_notification(
                    user=gm,
                    message=f"A new charge ticket from {req.department.title()} needs your approval."
                )

        if requisition_items:
            rv = RequisitionVoucher.objects.create(
                requester=req.requester,
                department=req.department,
                purpose=req.purpose,
                origin="employee"
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


            # 🔔 Notify all Budget Analysts
            budget_analysts = User.objects.filter(role="budget_analyst", is_role_confirmed=True)
            for analyst in budget_analysts:
                send_notification(
                    user=analyst,
                    message=f"A new Requisition Voucher ({rv.rv_number}) requires recommendation."
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
            message=f"Your material request has been evaluated by the {req.department.title()} department."
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
