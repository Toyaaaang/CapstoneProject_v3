import django_filters
from django.db.models import Q
from ..models import MaterialRequest

class MaterialRequestFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    department = django_filters.CharFilter(field_name="department", lookup_expr="iexact")
    work_order_no = django_filters.CharFilter(lookup_expr="icontains")
    created_at = django_filters.DateFromToRangeFilter()
    requester_name = django_filters.CharFilter(method="filter_by_requester_name")

    class Meta:
        model = MaterialRequest
        fields = ["status", "department", "work_order_no", "created_at", "requester_name"]

    def filter_by_requester_name(self, queryset, name, value):
        return queryset.filter(
            Q(requester__first_name__icontains=value) | 
            Q(requester__last_name__icontains=value)
        )
