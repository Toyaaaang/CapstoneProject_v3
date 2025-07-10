from rest_framework import serializers
from ..models import RequisitionVoucher, RequisitionItem, MaterialRequest
from inventory.models import Material
from inventory.serializers import MaterialSerializer
from ..utils import update_request_status
from notification.utils import send_notification

class RequisitionItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        source='material',
        write_only=True,
        required=False,
        allow_null=True,
    )

    material_name = serializers.CharField(source="material.name", read_only=True)
    custom_name = serializers.CharField(required=False, allow_blank=True)
    custom_unit = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = RequisitionItem
        fields = ['id', 'material', 'material_id', 'quantity', 'unit', 'material_name'
                  , 'custom_name', 'custom_unit']

    def get_material_name(self, obj):
        if obj.material:
            return obj.material.name
        return obj.custom_name or "Custom Item"

    def validate(self, data):
        material = data.get('material')
        custom_name = data.get('custom_name')
        custom_unit = data.get('custom_unit')

        if not material and not custom_name:
            raise serializers.ValidationError("Either a material or a custom name must be provided.")

        if not material and not custom_unit:
            raise serializers.ValidationError("Custom unit is required for custom materials.")

        return data
    
    def create(self, validated_data):
        # Auto-fill unit with custom_unit if it's a custom item
        if not validated_data.get("material") and validated_data.get("custom_unit"):
            validated_data["unit"] = validated_data["custom_unit"]
        return super().create(validated_data)


    
class MaterialRequestShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = ['id', 'work_order_no', 'purpose', 'requester'] 

class RequisitionVoucherSerializer(serializers.ModelSerializer):
    items = RequisitionItemSerializer(many=True)
    material_request = MaterialRequestShortSerializer(read_only=True)
    requester = serializers.SerializerMethodField()
    purpose_display = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RequisitionVoucher
        fields = '__all__'
        read_only_fields = ['rv_number', 'requester', 'department', 'origin']  # Prevent user from overriding

    def get_requester(self, obj):
        return {
            "id": obj.requester.id,
            "first_name": obj.requester.first_name,
            "last_name": obj.requester.last_name,
        }

    def get_purpose_display(self, obj):
        return "Restocking" if obj.is_restocking else f"Request #{obj.material_request.id if obj.material_request else 'N/A'}"

    def get_location(self, obj):
        if obj.material_request and hasattr(obj.material_request, "location"):
            return obj.material_request.location
        return None

    def validate(self, data):
        if not data.get("is_restocking") and not data.get("material_request"):
            raise serializers.ValidationError({
                "material_request": "This field is required unless this is a restocking voucher."
            })
        return data

    def create(self, validated_data):
        request = self.context["request"]
        items_data = validated_data.pop("items")

        # Ensure fallback values are injected
        validated_data["requester"] = request.user
        validated_data["department"] = validated_data.get("department", request.user.role)
        validated_data["origin"] = validated_data.get("origin", request.user.get_full_name() or request.user.username)

        rv = RequisitionVoucher.objects.create(**validated_data)

        # ✅ Handle custom material units
        for item in items_data:
            if not item.get("material") and item.get("custom_unit"):
                item["unit"] = item["custom_unit"]
            RequisitionItem.objects.create(requisition=rv, **item)

        # ✅ Handle related material request update and notification
        if rv.material_request and not rv.is_restocking:
            update_request_status(rv.material_request)
            send_notification(
                user=rv.material_request.requester,
                message=f"Your request #{rv.material_request.id} has been forwarded for requisition."
            )

        return rv


    
class RequisitionVoucherApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequisitionVoucher
        fields = ['status', 'recommended_by', 'final_approved_by', 'rejection_reason', 'rejected_by']

    def update(self, instance, validated_data):
        status = validated_data.get("status")

        if status == "rejected":
            instance.status = "rejected"
            instance.rejection_reason = validated_data.get("rejection_reason")
            instance.rejected_by = self.context['request'].user
        elif status == "recommended":
            instance.status = "recommended"
            instance.recommended_by = self.context['request'].user
            instance.rejection_reason = None
        elif status == "approved":
            instance.status = "approved"
            instance.final_approved_by = self.context['request'].user
            instance.rejection_reason = None

        instance.save()
        return instance

class PrintableRequisitionVoucherSerializer(serializers.ModelSerializer):
    items = RequisitionItemSerializer(many=True)
    requester = serializers.SerializerMethodField()
    department = serializers.CharField()
    location = serializers.SerializerMethodField()
    recommended_by = serializers.SerializerMethodField()
    final_approved_by = serializers.SerializerMethodField()
    recommended_by_signature = serializers.SerializerMethodField()
    final_approved_by_signature = serializers.SerializerMethodField()
    work_order_assigned_by = serializers.SerializerMethodField()
    work_order_assigned_by_signature = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = RequisitionVoucher
        fields = [
            'id', 'rv_number', 'status', 'department', 'requester', 'purpose', 'location',
            'created_at', 'items', 'recommended_by', 'final_approved_by',
            'recommended_by_signature', 'final_approved_by_signature',
            'work_order_assigned_by', 'work_order_assigned_by_signature'
        ]

    def get_requester(self, obj):
        if obj.requester:
            return {
                "id": obj.requester.id,
                "first_name": obj.requester.first_name,
                "last_name": obj.requester.last_name,
            }
        return None

    def get_location(self, obj):
        if obj.material_request and hasattr(obj.material_request, "location"):
            return obj.material_request.location
        return None

    def get_recommended_by(self, obj):
        if obj.recommended_by:
            return {
                "id": obj.recommended_by.id,
                "first_name": obj.recommended_by.first_name,
                "last_name": obj.recommended_by.last_name,
            }
        return None

    def get_final_approved_by(self, obj):
        if obj.final_approved_by:
            return {
                "id": obj.final_approved_by.id,
                "first_name": obj.final_approved_by.first_name,
                "last_name": obj.final_approved_by.last_name,
            }
        return None

    def get_recommended_by_signature(self, obj):
        if obj.recommended_by and hasattr(obj.recommended_by, "signature") and obj.recommended_by.signature:
            return obj.recommended_by.signature.url if hasattr(obj.recommended_by.signature, "url") else obj.recommended_by.signature
        return None

    def get_final_approved_by_signature(self, obj):
        if obj.final_approved_by and hasattr(obj.final_approved_by, "signature") and obj.final_approved_by.signature:
            return obj.final_approved_by.signature.url if hasattr(obj.final_approved_by.signature, "url") else obj.final_approved_by.signature
        return None

    def get_work_order_assigned_by(self, obj):
        mr = getattr(obj, "material_request", None)
        if mr and hasattr(mr, "work_order_assigned_by") and mr.work_order_assigned_by:
            return {
                "id": mr.work_order_assigned_by.id,
                "first_name": mr.work_order_assigned_by.first_name,
                "last_name": mr.work_order_assigned_by.last_name,
            }
        return None

    def get_work_order_assigned_by_signature(self, obj):
        mr = getattr(obj, "material_request", None)
        user = getattr(mr, "work_order_assigned_by", None) if mr else None
        if user and hasattr(user, "signature") and user.signature:
            return user.signature.url if hasattr(user.signature, "url") else user.signature
        return None

