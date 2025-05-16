from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch
from .models import Accountability, AccountabilityItem
from .serlializers import AccountabilitySerializer
from authentication.models import User

class AccountabilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Accountability.objects.prefetch_related(
        Prefetch("items", queryset=AccountabilityItem.objects.select_related("material", "charge_ticket"))
    ).select_related("user")
    serializer_class = AccountabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["warehouse_admin", "warehouse_staff", "manager"]:
            return self.queryset.all().order_by("-created_at")
        return self.queryset.filter(user=user).order_by("-created_at")

    @action(detail=False, methods=["get"])
    def my_accountability(self, request):
        queryset = self.queryset.filter(user=request.user).order_by("-created_at")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
