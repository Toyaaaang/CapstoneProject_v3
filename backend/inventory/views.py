from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Material, Inventory

# inventory/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Material, Inventory
from .serializers import MaterialSerializer, InventorySerializer, InventorySummarySerializer


class MaterialListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        materials = Material.objects.all()
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data)


class InventoryByDepartmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department = request.query_params.get("department")
        if not department:
            return Response({"error": "Missing department parameter"}, status=400)

        inventory = Inventory.objects.select_related("material").filter(department=department)
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)
    
class InventorySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventorySummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Inventory.objects.select_related("material").order_by("material__name", "department")

        if user.role in ["engineering", "operations_maintenance", "finance"]:
            return base_qs.filter(department=user.role)

        return base_qs
