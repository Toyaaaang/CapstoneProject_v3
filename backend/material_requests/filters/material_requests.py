import django_filters
from ..models import MaterialRequest

class MaterialRequestFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    department = django_filters.CharFilter(field_name="department", lookup_expr="iexact")
    work_order_no = django_filters.CharFilter(lookup_expr="icontains")
    created_at = django_filters.DateFromToRangeFilter()  # e.g. ?created_at_after=&created_at_before=

    class Meta:
        model = MaterialRequest
        fields = ["status", "department", "work_order_no", "created_at"]
