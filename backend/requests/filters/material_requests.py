# filters/material_request.py

import django_filters
from ..models import MaterialRequest

class MaterialRequestFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')
    department = django_filters.CharFilter(field_name="department__name", lookup_expr='icontains')
    date_requested = django_filters.DateFromToRangeFilter()

    class Meta:
        model = MaterialRequest
        fields = ['status', 'department', 'date_requested']
