from rest_framework import generics
from material_requests.models import Supplier
from material_requests.serializers.supplier import SupplierSerializer

class SupplierListView(generics.ListAPIView):
    queryset = Supplier.objects.filter(is_active=True)
    serializer_class = SupplierSerializer