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
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

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

        if department in ["engineering", "operations_maintenance"]:
            # Show all inventory except office supplies
            inventory = Inventory.objects.select_related("material").exclude(material__category="office_supply")
        elif department == "finance":
            # Show only office supplies
            inventory = Inventory.objects.select_related("material").filter(material__category="office_supply")
        else:
            # Default: show nothing or handle as needed
            inventory = Inventory.objects.none()

        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)
    
class InventorySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventorySummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Inventory.objects.select_related("material").order_by("material__name")

        if user.role in ["engineering", "operations_maintenance", "warehouse_admin", "manager", "warehouse_staff"]:
            # Include everything except office supplies (includes uncategorized)
            return base_qs.exclude(material__category="office_supply")
        elif user.role == "finance":
            # Only include office supplies
            return base_qs.filter(material__category="office_supply")
        else:
            # Optionally include uncategorized for other roles, if needed:
            return base_qs.filter(material__category="uncategorized")
        
class InventorySummaryNoPageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        base_qs = Inventory.objects.select_related("material").order_by("material__name")

        if user.role in ["engineering", "operations_maintenance", "warehouse_admin", "manager", "warehouse_staff"]:
            queryset = base_qs.exclude(material__category="office_supply")
        elif user.role == "finance":
            queryset = base_qs.filter(material__category="office_supply")
        else:
            queryset = base_qs.filter(material__category="uncategorized")

        serializer = InventorySummarySerializer(queryset, many=True)
        return Response(serializer.data)

class MaterialAdminViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAdminUser]

class InventoryAdminViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_materials_view(request):
    materials = Material.objects.all()
    serializer = MaterialSerializer(materials, many=True)
    return Response(serializer.data)
