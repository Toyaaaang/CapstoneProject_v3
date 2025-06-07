from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from inventory.models import Inventory
from ..models import ChargeTicket
from material_requests.serializers.charge import ChargeTicketSerializer
from material_requests.serializers.charge import ChargeTicketPrintableSerializer
from notification.utils import send_notification
from authentication.models import User
from accountability.models import Accountability, AccountabilityItem

def get_ticket_code(ticket: ChargeTicket) -> str:
    return ticket.ic_no or ticket.mc_no or f"Charge Ticket #{ticket.id}"


class ChargeTicketViewSet(viewsets.ModelViewSet):
    queryset = ChargeTicket.objects.all().prefetch_related("items")
    serializer_class = ChargeTicketSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            ticket = self.get_object()
        except ChargeTicket.DoesNotExist:
            return Response({"error": "Charge ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = user.role

        if ticket.approval_count == 1 and role == "manager":
            ticket.approval_count = 2
            ticket.approved_by = user
            ticket.save()

            # ✅ Notify requester
            send_notification(
                user=ticket.requester,
                message=f"Your charge ticket ({get_ticket_code(ticket)}) has been approved by the General Manager and is awaiting final approval."
            )

            # ✅ Notify Warehouse Admin(s)
            wh_admins = User.objects.filter(role="warehouse_admin")
            for wh in wh_admins:
                send_notification(
                    user=wh,
                    message=f"Charge ticket ({get_ticket_code(ticket)}) from {ticket.department.title()} is ready for your approval."
                )

        elif ticket.approval_count == 2 and role == "warehouse_admin":
            ticket.approval_count = 3
            ticket.issued_by = user
            ticket.status = "approved"
            ticket.save()

            # Mark the related material request as ready for release
            if ticket.material_request:
                ticket.material_request.status = "ready_for_release"
                ticket.material_request.save()

            # ✅ Notify requester
            send_notification(
                user=ticket.requester,
                message=f"Your charge ticket ({get_ticket_code(ticket)}) has been fully approved and is ready for release."
            )

            # ✅ Notify Warehouse Staff
            staff = User.objects.filter(role="warehouse_staff")
            for s in staff:
                send_notification(
                    user=s,
                    message=f"Charge ticket ({get_ticket_code(ticket)}) from {ticket.department.title()} is ready to be released."
                )

        else:
            return Response({"error": "You are not authorized to approve at this stage."}, status=status.HTTP_403_FORBIDDEN)

        ticket.save()

        if ticket.approval_count == 3:
            send_notification(
                user=ticket.requester,
                message=f"Your charge ticket ({get_ticket_code(ticket)}) has been fully approved and is ready for release."
            )


        return Response({"message": "Approval recorded."}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            ticket = self.get_object()
        except ChargeTicket.DoesNotExist:
            return Response({"error": "Charge ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = user.role
        reason = request.data.get("reason", "").strip()

        if ticket.status != "pending":
            return Response({"error": "This ticket has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

        if (
            (ticket.approval_count == 1 and role == "manager") or
            (ticket.approval_count == 2 and role == "warehouse_admin")
        ):
            ticket.status = "rejected"
            ticket.rejection_reason = reason or "No reason provided"
            ticket.save()

            send_notification(
                user=ticket.requester,
                message=f"Your charge ticket ({get_ticket_code(ticket)}) was rejected. Reason: {ticket.rejection_reason}"
            )

            return Response({"message": "Charge ticket rejected."}, status=status.HTTP_200_OK)

        return Response({"error": "You are not authorized to reject at this stage."}, status=status.HTTP_403_FORBIDDEN)

    
    @action(detail=False, methods=["get"])
    def pending_gm_approval(self, request):
        if request.user.role != "manager":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(approval_count=1).order_by("-created_at")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=["get"])
    def pending_admin_approval(self, request):
        if request.user.role != "warehouse_admin":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(approval_count=2).order_by("-created_at")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=["get"])
    def pending_release(self, request):
        if request.user.role != "warehouse_staff":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(
            approval_count=3,
            status="approved"
        ).order_by("-created_at")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        try:
            ticket = self.get_object()
        except ChargeTicket.DoesNotExist:
            return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status != "approved" or ticket.approval_count != 3:
            return Response({"error": "Ticket not ready for release."}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct inventory and build accountability
        for item in ticket.items.all():
            try:
                inv = Inventory.objects.get(
                    material=item.material,
                )

                if inv.quantity < item.quantity:
                    return Response({
                        "error": f"Not enough stock for {item.material.name}."
                    }, status=status.HTTP_400_BAD_REQUEST)

                inv.quantity -= item.quantity
                inv.save()

            except Inventory.DoesNotExist:
                return Response({
                    "error": f"Inventory not found for {item.material.name} in {ticket.department}."
                }, status=status.HTTP_400_BAD_REQUEST)

        # Create or get accountability log for the requester
        accountability, _ = Accountability.objects.get_or_create(
            user=ticket.requester,
            department=ticket.department,
        )

        for item in ticket.items.all():
            AccountabilityItem.objects.create(
                accountability=accountability,
                material=item.material,
                quantity=item.quantity,
                unit=item.unit,
                charge_ticket=ticket
            )

        # Mark ticket as released
        ticket.status = "released"
        ticket.save()

        # Mark the related material request as completed
        if ticket.material_request:
            ticket.material_request.status = "completed"
            ticket.material_request.save()

        # Notify requester
        send_notification(
            user=ticket.requester,
            message=f"Your charge ticket ({get_ticket_code(ticket)}) has been released by warehouse staff."
        )

        return Response({"message": "Ticket marked as released and accountability recorded."})

    @action(detail=True, methods=["get"])
    def printable(self, request, pk=None):
        ticket = self.get_object()
        serializer = ChargeTicketPrintableSerializer(ticket)
        return Response(serializer.data)
