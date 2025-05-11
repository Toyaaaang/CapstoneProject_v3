from django.shortcuts import render

# inventory/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Material, Inventory
from .serializers import MaterialSerializer, InventorySerializer

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