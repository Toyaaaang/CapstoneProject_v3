from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from authentication.models import User
from notification.utils import send_notification

from .models import MaterialRequest, ChargeTicket, ChargeTicketItem, RequisitionVoucher, RequisitionItem
from .serializers import MaterialRequestSerializer


# ------------------------------
# Create a Material Request
# POST /api/material-requests/
# ------------------------------
class CreateMaterialRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['requester'] = request.user.id
        serializer = MaterialRequestSerializer(data=data)

        if serializer.is_valid():
            material_request = serializer.save()

            department = material_request.department
            recipients = User.objects.filter(role=department)
            for user in recipients:
                send_notification(
                    user=user,
                    message=f"A new material request has been submitted to {department.title()} department."
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ------------------------------
# List Own Requests (History)
# GET /api/my-material-requests/
# ------------------------------
class MyMaterialRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        requests = MaterialRequest.objects.filter(requester=request.user).order_by('-created_at')
        serializer = MaterialRequestSerializer(requests, many=True)
        return Response(serializer.data)
# ------------------------------
# For Department detail of Material Requests
# ------------------------------  
class MaterialRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_dept = request.user.role
        status_filter = request.query_params.get("status", "pending")

        requests = MaterialRequest.objects.filter(
            department=user_dept,
            status=status_filter
        )
        serializer = MaterialRequestSerializer(requests, many=True)
        return Response(serializer.data)

class MaterialRequestDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            obj = MaterialRequest.objects.get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        serializer = MaterialRequestSerializer(obj)
        return Response(serializer.data)

# ------------------------------
# Evaluation of Material Requests
# ------------------------------
class EvaluateMaterialRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            request_obj = MaterialRequest.objects.get(pk=pk)
        except MaterialRequest.DoesNotExist:
            return Response({"error": "Request not found."}, status=404)

        action = request.data.get("action", "evaluate")  # default to "evaluate"

        if action == "reject":
            request_obj.status = "rejected"
            request_obj.save()
            send_notification(
                user=request_obj.requester,
                message=f"Your material request has been rejected by the {request_obj.department.title()} department."
            )
            return Response({"message": "Request rejected."}, status=200)

        if action == "invalid":
            request_obj.status = "invalid"
            request_obj.save()
            send_notification(
                user=request_obj.requester,
                message=f"Your material request has been marked as invalid by the {request_obj.department.title()} department."
            )
            return Response({"message": "Request marked as invalid."}, status=200)

        # Proceed with normal evaluation
        charge_items = request.data.get("charge_items", [])
        requisition_items = request.data.get("requisition_items", [])

        user = request.user
        dept = request_obj.department

        if charge_items:
            charge_ticket = ChargeTicket.objects.create(
                requester=request_obj.requester,
                department=dept,
                purpose=request_obj.purpose,
                origin="employee"
            )
            for item in charge_items:
                ChargeTicketItem.objects.create(
                    charge_ticket=charge_ticket,
                    material_id=item["material_id"],
                    quantity=item["quantity"],
                    unit=item["unit"]
                )

        if requisition_items:
            rv = RequisitionVoucher.objects.create(
                requester=request_obj.requester,
                department=dept,
                purpose=request_obj.purpose,
                origin="employee"
            )
            for item in requisition_items:
                RequisitionItem.objects.create(
                    requisition=rv,
                    material_id=item["material_id"],
                    quantity=item["quantity"],
                    unit=item["unit"]
                )

        # Determine status
        if charge_items and requisition_items:
            request_obj.status = "partially_fulfilled"
        elif charge_items:
            request_obj.status = "charged"
        elif requisition_items:
            request_obj.status = "requisitioned"
        else:
            request_obj.status = "invalid"

        request_obj.save()

        send_notification(
            user=request_obj.requester,
            message=f"Your material request has been evaluated by the {dept.title()} department."
        )

        return Response({"message": "Evaluation complete."}, status=200)

    
# ------------------------------
# Approval of Charged Requests
# ------------------------------

class ApproveChargeTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = ChargeTicket.objects.get(pk=pk)
        except ChargeTicket.DoesNotExist:
            return Response({"error": "Charge ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = user.role

        # Step 1: GM Approval (approval_count == 1)
        if ticket.approval_count == 1 and role == "manager":
            ticket.approval_count = 2
            ticket.approved_by = user

        # Step 2: Warehouse Admin Approval (approval_count == 2)
        elif ticket.approval_count == 2 and role == "warehouse_admin":
            ticket.approval_count = 3
            ticket.issued_by = user
            ticket.status = "approved"

        else:
            return Response({"error": "You are not authorized to approve at this stage."}, status=status.HTTP_403_FORBIDDEN)

        ticket.save()

        # Notify the requester once fully approved
        if ticket.approval_count == 3:
            send_notification(
                user=ticket.requester,
                message="Your charge ticket has been fully approved and is ready for release."
            )

        return Response({"message": "Approval recorded."}, status=status.HTTP_200_OK)